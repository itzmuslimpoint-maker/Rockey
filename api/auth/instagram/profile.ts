import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase } from '../../_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { userId } = req.query;
    const igUserCookie = req.cookies.ig_user;
    
    const supabase = getSupabase();
    
    if (userId && supabase) {
      const { data, error } = await supabase
        .from("instagram_accounts")
        .select("username")
        .eq("user_id", userId)
        .maybeSingle();

      if (!error && data?.username) {
        return res.json({ username: data.username });
      }
    }

    if (igUserCookie) {
      try {
        const decodedCookie = decodeURIComponent(igUserCookie);
        const igUser = JSON.parse(decodedCookie);
        if (igUser.username) {
          return res.json({ username: igUser.username });
        }
      } catch (e) {
        // Ignore parse error
      }
    }
    
    return res.json({ username: null });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
