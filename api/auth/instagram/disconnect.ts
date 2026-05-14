import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase } from '../../_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body;
  const supabase = getSupabase();
  
  if (userId && supabase) {
    try {
      await supabase
        .from("users")
        .update({
          instagram_connected: false,
          instagram_token: null,
          instagram_user_id: null
        })
        .eq("id", userId);
    } catch (err) {
      console.error("Disconnect error:", err);
    }
  }

  const cookieOptions = 'Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0';
  res.setHeader('Set-Cookie', [
    `ig_access_token=; ${cookieOptions}`,
    `ig_user=; ${cookieOptions}`
  ]);
  
  res.json({ success: true });
}
