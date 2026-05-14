import type { VercelRequest, VercelResponse } from '@vercel/node';
import { syncInstagramData } from '../_lib/instagram-sync';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, userId } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host;
  const detectedBaseUrl = `${protocol}://${host}`;
  const baseUrl = (process.env.APP_URL || detectedBaseUrl).replace(/\/$/, "");
  const redirectUri = `${baseUrl}/auth/instagram/callback`;

  if (!clientSecret) {
    return res.status(500).json({ error: 'INSTAGRAM_CLIENT_SECRET is not configured on the server.' });
  }

  try {
    // 1. Exchange code for access token
    const clientId = process.env.INSTAGRAM_CLIENT_ID || "2297999277390097";
    const tokenResponse = await fetch(`https://graph.facebook.com/v21.0/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`);
    const tokens = await tokenResponse.json();
    
    if (tokens.error) {
      return res.status(400).json({ error: tokens.error.message || 'Failed to exchange code' });
    }

    const userAccessToken = tokens.access_token;

    // 2. Get Facebook Pages and linked Instagram account
    const pagesResponse = await fetch(`https://graph.facebook.com/v21.0/me/accounts?access_token=${userAccessToken}`);
    const pagesData = await pagesResponse.json();
    
    let igUser = null;
    let pageId = null;
    let pageAccessToken = null;

    if (pagesData.data) {
      for (const page of pagesData.data) {
        const igCheckResponse = await fetch(`https://graph.facebook.com/v21.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`);
        const igCheckData = await igCheckResponse.json();
        
        if (igCheckData.instagram_business_account) {
          igUser = igCheckData.instagram_business_account;
          pageId = page.id;
          pageAccessToken = page.access_token;
          break;
        }
      }
    }

    if (!igUser) {
      return res.status(400).json({ error: "No Instagram Business Account found linked to your Facebook Pages." });
    }

    // 3. Trigger background sync (non-blocking)
    if (userId) {
      // We use pageAccessToken for messaging/automation flow
      syncInstagramData(userId, pageAccessToken, igUser.id, pageId).catch(err => {
        console.error("Background sync error:", err);
      });
    }

    // 4. Set Cookies using pageAccessToken
    const cookieOptions = 'Path=/; HttpOnly; Secure; SameSite=None; Max-Age=5184000'; // 60 days
    res.setHeader('Set-Cookie', [
      `ig_access_token=${pageAccessToken}; ${cookieOptions}`,
      `ig_user=${encodeURIComponent(JSON.stringify(igUser))}; ${cookieOptions}`
    ]);

    return res.status(200).json({ success: true, user: igUser });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error during exchange' });
  }
}
