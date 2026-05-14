import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase } from '../_lib/supabase';

/**
 * /api/automations/rules
 *   GET  ?userId=...                        → list rules
 *   POST { userId, ...rule }                → create rule
 *   PATCH { id, userId, ...patch }          → update rule
 *   DELETE { id, userId }                   → delete rule
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabase = getSupabase();
  if (!supabase) return res.status(500).json({ error: 'supabase not configured' });

  if (req.method === 'GET') {
    const userId = String(req.query.userId || '');
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const { data, error } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ rules: data || [] });
  }

  if (req.method === 'POST') {
    const { userId, ...rule } = req.body || {};
    if (!userId) return res.status(400).json({ error: 'userId required' });
    if (!rule.name || !rule.trigger_type) {
      return res.status(400).json({ error: 'name and trigger_type are required' });
    }
    const { data, error } = await supabase
      .from('automation_rules')
      .insert({ user_id: userId, ...rule })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ rule: data });
  }

  if (req.method === 'PATCH') {
    const { id, userId, ...patch } = req.body || {};
    if (!id || !userId) return res.status(400).json({ error: 'id and userId required' });
    const { data, error } = await supabase
      .from('automation_rules')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ rule: data });
  }

  if (req.method === 'DELETE') {
    const { id, userId } = req.body || {};
    if (!id || !userId) return res.status(400).json({ error: 'id and userId required' });
    const { error } = await supabase
      .from('automation_rules')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  }

  return res.status(405).json({ error: 'method not allowed' });
}
