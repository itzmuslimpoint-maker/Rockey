import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * GET /api/instagram/lookup?username=<handle>
 *
 * Returns a lightweight, **public** preview of an Instagram profile so the
 * user can confirm "yes that's me" before launching the OAuth flow.
 *
 * We try a few public sources because Instagram has been rate-limiting and
 * gating its public endpoints:
 *   1. https://www.instagram.com/<username>/?__a=1&__d=dis      (legacy)
 *   2. https://i.instagram.com/api/v1/users/web_profile_info/?username=
 *
 * Both occasionally return 401 / login-required.  In that case we fall back
 * to a minimal "found-but-no-details" response so the user can still
 * proceed to OAuth.
 */
const UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

const VALID_USERNAME = /^[A-Za-z0-9._]{1,30}$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const raw = String(req.query.username || '').trim().replace(/^@/, '');
  if (!raw) return res.status(400).json({ error: 'username is required' });
  if (!VALID_USERNAME.test(raw)) {
    return res.status(400).json({ error: 'Invalid Instagram username format.' });
  }

  // ── Attempt 1: web_profile_info ───────────────────────────────────────
  try {
    const r = await fetch(
      `https://i.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(raw)}`,
      {
        headers: {
          'User-Agent': UA,
          'X-IG-App-ID': '936619743392459',
          Accept: 'application/json',
        },
      }
    );
    if (r.ok) {
      const data: any = await r.json();
      const u = data?.data?.user;
      if (u) {
        return res.json({
          id: u.id,
          username: u.username,
          full_name: u.full_name,
          profile_pic_url: u.profile_pic_url_hd || u.profile_pic_url,
          follower_count: u.edge_followed_by?.count,
          media_count: u.edge_owner_to_timeline_media?.count,
          is_business: !!u.is_business_account,
          is_private: !!u.is_private,
        });
      }
    }
    if (r.status === 404) {
      return res.status(404).json({ error: 'No Instagram account with that username.' });
    }
  } catch (e) {
    console.warn('[lookup] web_profile_info failed:', e);
  }

  // ── Attempt 2: ?__a=1 fallback ────────────────────────────────────────
  try {
    const r = await fetch(
      `https://www.instagram.com/${encodeURIComponent(raw)}/?__a=1&__d=dis`,
      { headers: { 'User-Agent': UA, Accept: 'application/json' } }
    );
    if (r.ok) {
      const data: any = await r.json();
      const u = data?.graphql?.user;
      if (u) {
        return res.json({
          id: u.id,
          username: u.username,
          full_name: u.full_name,
          profile_pic_url: u.profile_pic_url_hd || u.profile_pic_url,
          follower_count: u.edge_followed_by?.count,
          media_count: u.edge_owner_to_timeline_media?.count,
          is_business: !!u.is_business_account,
          is_private: !!u.is_private,
        });
      }
    }
  } catch (e) {
    console.warn('[lookup] __a=1 fallback failed:', e);
  }

  // ── Attempt 3: graceful fallback ──────────────────────────────────────
  // Instagram is gating these endpoints. We can't confirm the profile
  // exists publicly, but the user said it's theirs — let them proceed.
  return res.json({
    username: raw,
    full_name: raw,
    follower_count: undefined,
    media_count: undefined,
    _fallback: true,
  });
}
