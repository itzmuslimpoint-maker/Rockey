import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Generates the Facebook Login for Business OAuth URL.
 *
 * IMPORTANT: We deliberately use facebook.com/v21.0/dialog/oauth here (NOT
 * instagram.com/oauth/authorize), because:
 *  - We need a Facebook USER access token so we can list the user's Pages
 *    and locate the Instagram Business Account linked to one of them.
 *  - The token returned by instagram.com/oauth/authorize is NOT compatible
 *    with /me/accounts or graph.facebook.com endpoints used to send DMs and
 *    manage comments.
 *
 * This MUST stay in sync with /api/instagram/exchange.ts which exchanges
 * the code at graph.facebook.com.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  const { userId } = req.query;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host;
  const detectedBaseUrl = `${protocol}://${host}`;

  const clientId = process.env.INSTAGRAM_CLIENT_ID?.trim();
  const baseUrl = (process.env.APP_URL || detectedBaseUrl).replace(/\/$/, '');

  if (!clientId) {
    return res.status(400).json({
      error:
        'INSTAGRAM_CLIENT_ID is not configured. Please set it in your Vercel environment variables.',
    });
  }

  const redirectUri = `${baseUrl}/auth/instagram/callback`;

  // Scopes for Facebook Login for Business that grant Instagram Graph API
  // access (DMs, comments, content publishing, insights).
  const scopes = [
    'instagram_basic',
    'instagram_manage_messages',
    'instagram_manage_comments',
    'instagram_content_publish',
    'instagram_manage_insights',
    'pages_show_list',
    'pages_read_engagement',
    'pages_manage_metadata',
    'business_management',
  ].join(',');

  const state = userId ? String(userId) : '';

  const authUrl =
    `https://www.facebook.com/v21.0/dialog/oauth` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&response_type=code` +
    `&state=${encodeURIComponent(state)}`;

  res.json({ url: authUrl, redirectUri });
}
