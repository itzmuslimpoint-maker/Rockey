import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase } from '../_lib/supabase';

/**
 * POST /api/instagram/exchange-direct
 *
 * Exchanges a code from the Instagram-Login API (instagram.com/oauth/authorize)
 * for a short-lived token, then upgrades it to a long-lived (60-day) token,
 * fetches the user profile, and persists everything to Supabase.
 *
 * This is intentionally a separate path from /api/instagram/exchange so we
 * can support both flows (Facebook Login + Instagram-Login) without one
 * stepping on the other.
 */
const IG_API = 'https://graph.instagram.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, userId } = req.body || {};
  if (!code) return res.status(400).json({ error: 'Missing code' });

  const clientId = (
    process.env.INSTAGRAM_DIRECT_CLIENT_ID ||
    process.env.INSTAGRAM_CLIENT_ID ||
    ''
  ).trim();
  const clientSecret = (
    process.env.INSTAGRAM_DIRECT_CLIENT_SECRET ||
    process.env.INSTAGRAM_CLIENT_SECRET ||
    ''
  ).trim();

  if (!clientId || !clientSecret) {
    return res
      .status(500)
      .json({ error: 'Instagram OAuth credentials are not configured.' });
  }

  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host;
  const detectedBaseUrl = `${protocol}://${host}`;
  const baseUrl = (process.env.APP_URL || detectedBaseUrl).replace(/\/$/, '');
  const redirectUri = `${baseUrl}/auth/instagram/callback`;

  try {
    // 1. Short-lived token (form-encoded body)
    const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code: String(code),
      }),
    });
    const tokenJson: any = await tokenRes.json();
    if (!tokenRes.ok || tokenJson.error_message || tokenJson.error) {
      console.error('[exchange-direct] short token failed:', tokenJson);
      return res.status(400).json({
        error:
          tokenJson.error_message ||
          tokenJson.error?.message ||
          'Failed to exchange code',
      });
    }

    const shortToken: string = tokenJson.access_token;
    const igUserId: string = String(tokenJson.user_id);

    // 2. Long-lived token (60 days)
    let longToken = shortToken;
    try {
      const r = await fetch(
        `${IG_API}/access_token?grant_type=ig_exchange_token` +
          `&client_secret=${clientSecret}` +
          `&access_token=${shortToken}`
      );
      const j: any = await r.json();
      if (j.access_token) longToken = j.access_token;
    } catch (e) {
      console.warn('[exchange-direct] long-token swap failed:', e);
    }

    // 3. Profile
    const profRes = await fetch(
      `${IG_API}/me?fields=id,username,name,account_type,profile_picture_url,followers_count,follows_count,media_count,biography&access_token=${longToken}`
    );
    const profile: any = await profRes.json();
    if (profile.error) {
      console.error('[exchange-direct] profile fetch failed:', profile.error);
      return res.status(400).json({ error: profile.error.message });
    }

    const igUser = {
      id: igUserId,
      username: profile.username,
      name: profile.name,
      profile_picture_url: profile.profile_picture_url,
      followers: profile.followers_count,
      following: profile.follows_count,
      media_count: profile.media_count,
      biography: profile.biography,
    };

    // 4. Persist
    const supabase = getSupabase();
    if (userId && supabase) {
      try {
        await supabase
          .from('users')
          .update({
            instagram_connected: true,
            instagram_token: longToken,
            instagram_user_id: igUserId,
          })
          .eq('id', userId);

        await supabase
          .from('instagram_accounts')
          .upsert(
            {
              user_id: String(userId),
              ig_user_id: igUserId,
              username: igUser.username,
              name: igUser.name,
              profile_picture: igUser.profile_picture_url,
              followers: igUser.followers,
              following: igUser.following,
              media_count: igUser.media_count,
              biography: igUser.biography,
              access_token: longToken,
              page_id: null,
              page_name: null,
              connected_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          );
      } catch (dbErr) {
        console.error('[exchange-direct] Supabase persist failed:', dbErr);
      }
    }

    // 5. Cookies
    const cookieOptions = 'Path=/; HttpOnly; Secure; SameSite=None; Max-Age=5184000';
    res.setHeader('Set-Cookie', [
      `ig_access_token=${longToken}; ${cookieOptions}`,
      `ig_user=${encodeURIComponent(JSON.stringify(igUser))}; ${cookieOptions}`,
    ]);

    return res.status(200).json({ success: true, user: igUser });
  } catch (error: any) {
    console.error('[exchange-direct] unexpected error:', error);
    return res.status(500).json({ error: error?.message || 'Internal server error' });
  }
}
