import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Direct Instagram-Login API OAuth URL.
 *
 * Used by the "Connect with Instagram (Easy)" path which redirects users
 * straight to instagram.com/oauth/authorize — they only see the Instagram
 * permissions screen, never Facebook.
 *
 * The exchange happens at /api/instagram/exchange-direct (different from
 * the Facebook flow's /api/instagram/exchange which talks to graph.facebook.com).
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  const { userId } = req.query;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host;
  const detectedBaseUrl = `${protocol}://${host}`;

  const clientId = (
    process.env.INSTAGRAM_DIRECT_CLIENT_ID ||
    process.env.INSTAGRAM_CLIENT_ID ||
    ''
  ).trim();
  const baseUrl = (process.env.APP_URL || detectedBaseUrl).replace(/\/$/, '');

  if (!clientId) {
    return res.status(400).json({
      error: 'INSTAGRAM_CLIENT_ID is not configured on the server.',
    });
  }

  const redirectUri = `${baseUrl}/auth/instagram/callback`;

  // Instagram-Login API scopes (do NOT use the facebook.com scopes here).
  const scopes = [
    'instagram_business_basic',
    'instagram_business_manage_messages',
    'instagram_business_manage_comments',
    'instagram_business_content_publish',
    'instagram_business_manage_insights',
  ].join(',');

  // Encode the auth method in state so the SPA callback knows which
  // exchange endpoint to call.
  const state = encodeURIComponent(
    JSON.stringify({ userId: userId || '', method: 'direct' })
  );

  const authUrl =
    `https://www.instagram.com/oauth/authorize` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&response_type=code` +
    `&state=${state}` +
    `&force_reauth=true`;

  res.json({ url: authUrl, redirectUri });
}
