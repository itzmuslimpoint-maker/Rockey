import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { userId } = req.query;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host;
  const detectedBaseUrl = `${protocol}://${host}`;
  
  const clientId = process.env.INSTAGRAM_CLIENT_ID?.trim();
  const baseUrl = (process.env.APP_URL || detectedBaseUrl).replace(/\/$/, "");
  
  if (!clientId) {
    return res.status(400).json({ 
      error: "INSTAGRAM_CLIENT_ID is not configured. Please set it in your environment variables/secrets." 
    });
  }

  const redirectUri = `${baseUrl}/auth/instagram/callback`;
  
  const scopes = [
    "instagram_business_basic",
    "instagram_business_manage_messages",
    "instagram_business_manage_comments",
    "pages_show_list",
    "pages_read_engagement"
  ].join(",");

  const state = userId ? String(userId) : "";
  const authUrl = `https://www.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&response_type=code&state=${state}`;
  
  res.json({ url: authUrl });
}
