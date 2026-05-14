import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase } from '../_lib/supabase';

/**
 * /api/automations/scheduled-posts
 *   GET    ?userId=...                                  → list
 *   POST   { userId, caption, image_url, scheduled_for } → schedule
 *   DELETE { id, userId }                               → cancel
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabase = getSupabase();
  if (!supabase) return res.status(500).json({ error: 'supabase not configured' });

  if (req.method === 'GET') {
    const userId = String(req.query.userId || '');
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const { data, error } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('user_id', userId)
      .order('scheduled_for', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ posts: data || [] });
  }

  if (req.method === 'POST') {
    const { userId, caption, image_url, scheduled_for, media_type } = req.body || {};
    if (!userId || !image_url || !scheduled_for) {
      return res.status(400).json({ error: 'userId, image_url, scheduled_for are required' });
    }
    const { data, error } = await supabase
      .from('scheduled_posts')
      .insert({
        user_id: userId,
        caption,
        image_url,
        scheduled_for,
        media_type: media_type || 'IMAGE',
      })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ post: data });
  }

  if (req.method === 'DELETE') {
    const { id, userId } = req.body || {};
    if (!id || !userId) return res.status(400).json({ error: 'id and userId required' });
    const { error } = await supabase
      .from('scheduled_posts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .eq('status', 'pending');
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  }

  return res.status(405).json({ error: 'method not allowed' });
}
