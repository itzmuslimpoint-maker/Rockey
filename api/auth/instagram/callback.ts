import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase } from '../../_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code, state: userId } = req.query;

  if (!code) {
    return res.redirect('/dashboard?error=missing_code');
  }

  try {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host;
    const detectedBaseUrl = `${protocol}://${host}`;
    const baseUrl = (process.env.APP_URL || detectedBaseUrl).replace(/\/$/, "");
    const redirectUri = `${baseUrl}/auth/instagram/callback`;

    // 1. Exchange code for short-lived token
    const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: process.env.INSTAGRAM_CLIENT_ID || '',
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET || '',
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code: String(code),
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      console.error('Instagram Token Exchange Error:', tokenData);
      return res.redirect('/dashboard?error=token_exchange_failed');
    }

    const { access_token, user_id } = tokenData;

    // 2. Get user profile
    const profileRes = await fetch(`https://graph.instagram.com/v12.0/me?fields=id,username&access_token=${access_token}`);
    const profileData = await profileRes.json();

    // 3. Save to Supabase if userId is provided
    const supabase = getSupabase();
    if (userId && supabase) {
      await supabase
        .from('instagram_accounts')
        .upsert({
          user_id: String(userId),
          instagram_user_id: String(user_id),
          username: profileData.username,
          access_token: access_token,
          updated_at: new Date().toISOString(),
        });
        
      await supabase
        .from('users')
        .update({ instagram_connected: true })
        .eq('id', userId);
    }

    // 4. Set cookies
    const cookieOptions = `Path=/; HttpOnly; Secure; SameSite=None; Max-Age=${60 * 60 * 24 * 30}`;
    res.setHeader('Set-Cookie', [
      `ig_access_token=${access_token}; ${cookieOptions}`,
      `ig_user=${JSON.stringify({ id: user_id, username: profileData.username })}; ${cookieOptions}`
    ]);

    return res.redirect('/dashboard?success=instagram_connected');
  } catch (error) {
    console.error('Instagram Callback Error:', error);
    return res.redirect('/dashboard?error=internal_server_error');
  }
}
