import type { VercelRequest, VercelResponse } from '@vercel/node';
import { syncInstagramData } from '../_lib/instagram-sync';
import { getSupabase } from '../_lib/supabase';

/**
 * POST /api/instagram/exchange
 *
 * Exchanges an authorization code from Facebook Login for Business for:
 *  1. A user access token
 *  2. The user's Facebook Pages
 *  3. The Instagram Business Account linked to one of those Pages
 *  4. The Instagram profile (username, picture, follower count)
 *
 * Then persists everything in Supabase (so the user gets a personalized
 * Dashboard) and sets HTTP-only cookies as a session-fallback.
 */
const API_VERSION = 'v21.0';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, userId } = req.body || {};
  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  const clientId = process.env.INSTAGRAM_CLIENT_ID?.trim();
  const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    console.error('[exchange] Missing INSTAGRAM_CLIENT_ID or INSTAGRAM_CLIENT_SECRET');
    return res
      .status(500)
      .json({ error: 'Instagram OAuth credentials are not configured on the server.' });
  }

  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host;
  const detectedBaseUrl = `${protocol}://${host}`;
  const baseUrl = (process.env.APP_URL || detectedBaseUrl).replace(/\/$/, '');
  const redirectUri = `${baseUrl}/auth/instagram/callback`;

  try {
    // ── 1. Exchange code → short-lived user access token ─────────────────
    const tokenUrl =
      `https://graph.facebook.com/${API_VERSION}/oauth/access_token` +
      `?client_id=${clientId}` +
      `&client_secret=${clientSecret}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&code=${encodeURIComponent(String(code))}`;

    const tokenRes = await fetch(tokenUrl);
    const tokenJson = await tokenRes.json();

    if (!tokenRes.ok || tokenJson.error) {
      console.error('[exchange] Token exchange failed:', tokenJson);
      return res.status(400).json({
        error:
          tokenJson?.error?.message ||
          'Failed to exchange authorization code. Check that the redirect URI matches the one configured in your Meta App.',
      });
    }

    const shortToken: string = tokenJson.access_token;

    // ── 2. Upgrade to long-lived user token (60 days) ────────────────────
    let userAccessToken = shortToken;
    try {
      const longUrl =
        `https://graph.facebook.com/${API_VERSION}/oauth/access_token` +
        `?grant_type=fb_exchange_token` +
        `&client_id=${clientId}` +
        `&client_secret=${clientSecret}` +
        `&fb_exchange_token=${shortToken}`;
      const longRes = await fetch(longUrl);
      const longJson = await longRes.json();
      if (longJson.access_token) userAccessToken = longJson.access_token;
    } catch (err) {
      console.warn('[exchange] long-lived token swap failed, using short-lived:', err);
    }

    // ── 3. List user's Pages ─────────────────────────────────────────────
    const pagesRes = await fetch(
      `https://graph.facebook.com/${API_VERSION}/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${userAccessToken}`
    );
    const pagesJson = await pagesRes.json();

    if (!pagesJson.data || pagesJson.data.length === 0) {
      return res.status(400).json({
        error:
          'BUSINESS_ACCOUNT_REQUIRED: No Facebook Pages found. Connect your Instagram Business account to a Facebook Page first.',
      });
    }

    // ── 4. Find the Page that has an Instagram Business Account ──────────
    let igBusinessId: string | null = null;
    let pageAccessToken: string | null = null;
    let pageId: string | null = null;
    let pageName: string | null = null;

    for (const page of pagesJson.data) {
      if (page.instagram_business_account?.id) {
        igBusinessId = page.instagram_business_account.id;
        pageAccessToken = page.access_token;
        pageId = page.id;
        pageName = page.name;
        break;
      }
    }

    // Some Pages don't include `instagram_business_account` in the list call,
    // so we fall back to a per-page lookup.
    if (!igBusinessId) {
      for (const page of pagesJson.data) {
        const r = await fetch(
          `https://graph.facebook.com/${API_VERSION}/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
        );
        const j = await r.json();
        if (j.instagram_business_account?.id) {
          igBusinessId = j.instagram_business_account.id;
          pageAccessToken = page.access_token;
          pageId = page.id;
          pageName = page.name;
          break;
        }
      }
    }

    if (!igBusinessId || !pageAccessToken || !pageId) {
      return res.status(400).json({
        error:
          'BUSINESS_ACCOUNT_REQUIRED: No Instagram Business account is linked to your Facebook Pages. In the Instagram app go to Settings → Account → Switch to Professional Account, then link it to a Facebook Page.',
      });
    }

    // ── 5. Fetch the Instagram profile ───────────────────────────────────
    const profileRes = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${igBusinessId}?fields=username,name,profile_picture_url,followers_count,follows_count,media_count,biography&access_token=${pageAccessToken}`
    );
    const profile = await profileRes.json();

    if (profile.error) {
      console.error('[exchange] profile fetch failed:', profile.error);
      return res.status(400).json({ error: profile.error.message });
    }

    const igUser = {
      id: igBusinessId,
      username: profile.username,
      name: profile.name,
      profile_picture_url: profile.profile_picture_url,
      followers: profile.followers_count,
      following: profile.follows_count,
      media_count: profile.media_count,
      biography: profile.biography,
      page_id: pageId,
      page_name: pageName,
    };

    // ── 6. Persist to Supabase ───────────────────────────────────────────
    const supabase = getSupabase();
    if (userId && supabase) {
      try {
        await supabase
          .from('users')
          .update({
            instagram_connected: true,
            instagram_token: pageAccessToken,
            instagram_user_id: igBusinessId,
          })
          .eq('id', userId);

        await supabase
          .from('instagram_accounts')
          .upsert(
            {
              user_id: String(userId),
              ig_user_id: igBusinessId,
              username: igUser.username,
              name: igUser.name,
              profile_picture: igUser.profile_picture_url,
              followers: igUser.followers,
              following: igUser.following,
              media_count: igUser.media_count,
              biography: igUser.biography,
              access_token: pageAccessToken,
              page_id: pageId,
              page_name: pageName,
              connected_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          );

        // Subscribe the Page to webhook events so DM/comment/follow
        // automations actually fire. Best-effort; non-fatal.
        await fetch(
          `https://graph.facebook.com/${API_VERSION}/${pageId}/subscribed_apps?subscribed_fields=messages,messaging_postbacks,feed,comments,mention&access_token=${pageAccessToken}`,
          { method: 'POST' }
        ).catch((e) => console.warn('[exchange] webhook subscribe failed:', e));

        // Kick off background sync (non-blocking)
        syncInstagramData(String(userId), pageAccessToken, igBusinessId, pageId).catch((err) =>
          console.error('[exchange] background sync failed:', err)
        );
      } catch (dbErr) {
        console.error('[exchange] Supabase persist failed:', dbErr);
      }
    }

    // ── 7. Cookies (session fallback) ────────────────────────────────────
    const cookieOptions = 'Path=/; HttpOnly; Secure; SameSite=None; Max-Age=5184000';
    res.setHeader('Set-Cookie', [
      `ig_access_token=${pageAccessToken}; ${cookieOptions}`,
      `ig_user=${encodeURIComponent(JSON.stringify(igUser))}; ${cookieOptions}`,
    ]);

    return res.status(200).json({ success: true, user: igUser });
  } catch (error: any) {
    console.error('[exchange] unexpected error:', error);
    return res.status(500).json({ error: error?.message || 'Internal server error' });
  }
}
