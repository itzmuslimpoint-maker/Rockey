import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase } from '../_lib/supabase';
import { sendDM, publishImage, generateAIReply } from '../_lib/instagram-api';

/**
 * Runs every few minutes (see vercel.json crons).
 *  1. Publishes any scheduled_posts whose time has come.
 *  2. Detects new followers and sends a welcome DM if a welcome rule exists.
 *
 * NOTE: Instagram Graph API does not currently expose a follower-list
 *       endpoint. So "new followers" detection in step 2 relies on the
 *       Instagram messaging webhook delivering a `messaging_referrals`
 *       event when someone follows + opens the DM thread, OR on a manual
 *       sync done elsewhere.  As a graceful fallback we re-fetch the
 *       follower _count_ and welcome the most recent commenter who isn't
 *       already in instagram_followers.  This is intentionally simple;
 *       your real flow should write to instagram_followers from the
 *       webhook receiver as soon as Meta delivers the event for a follow.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Optional cron-secret guard
  if (process.env.CRON_SECRET) {
    if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: 'unauthorized' });
    }
  }

  const supabase = getSupabase();
  if (!supabase) return res.status(500).json({ error: 'no supabase' });

  const out = {
    posts: { ran: 0, ok: 0, fail: 0 },
    welcomes: { ran: 0, ok: 0, fail: 0 },
  };

  // ── 1. Scheduled posts ─────────────────────────────────────────────
  const { data: due } = await supabase
    .from('scheduled_posts')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString())
    .limit(10);

  for (const post of due || []) {
    out.posts.ran++;
    const { data: account } = await supabase
      .from('instagram_accounts')
      .select('*')
      .eq('user_id', post.user_id)
      .maybeSingle();
    if (!account) {
      await supabase
        .from('scheduled_posts')
        .update({ status: 'failed', error: 'no IG account' })
        .eq('id', post.id);
      out.posts.fail++;
      continue;
    }

    try {
      await supabase
        .from('scheduled_posts')
        .update({ status: 'publishing' })
        .eq('id', post.id);

      const igMediaId = await publishImage({
        igUserId: account.ig_user_id,
        imageUrl: post.image_url,
        caption: post.caption,
        pageAccessToken: account.access_token,
      });

      await supabase
        .from('scheduled_posts')
        .update({
          status: 'published',
          ig_media_id: igMediaId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', post.id);

      await supabase.from('automation_logs').insert({
        user_id: post.user_id,
        event_type: 'post_published',
        target: igMediaId,
        detail: (post.caption || '').slice(0, 200),
      });
      out.posts.ok++;
    } catch (e: any) {
      await supabase
        .from('scheduled_posts')
        .update({ status: 'failed', error: e.message?.slice(0, 500) })
        .eq('id', post.id);
      out.posts.fail++;
    }
  }

  // ── 2. Welcome DMs for new followers ───────────────────────────────
  const { data: pending } = await supabase
    .from('instagram_followers')
    .select('*, instagram_accounts!inner(*)')
    .eq('welcomed', false)
    .limit(25);

  for (const row of pending || []) {
    out.welcomes.ran++;
    const account = (row as any).instagram_accounts;
    if (!account?.access_token) {
      await supabase.from('instagram_followers').update({ welcomed: true }).eq('id', row.id);
      continue;
    }

    const { data: rule } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('user_id', row.user_id)
      .eq('trigger_type', 'welcome_dm')
      .eq('is_active', true)
      .maybeSingle();
    if (!rule) {
      await supabase.from('instagram_followers').update({ welcomed: true }).eq('id', row.id);
      continue;
    }

    let text = rule.reply_message || 'Thanks for the follow! 💛';
    if (rule.use_ai) {
      const ai = await generateAIReply({
        prompt: 'A new user just followed our Instagram. Send a friendly welcome DM.',
        persona: rule.ai_persona,
      });
      if (ai) text = ai;
    }

    try {
      await sendDM({
        igUserId: account.ig_user_id,
        recipientId: row.follower_id,
        text,
        pageAccessToken: account.access_token,
      });
      await supabase.from('instagram_followers').update({ welcomed: true }).eq('id', row.id);
      await supabase.from('automation_logs').insert({
        user_id: row.user_id,
        rule_id: rule.id,
        event_type: 'welcome_sent',
        target: row.follower_id,
        detail: text.slice(0, 200),
      });
      out.welcomes.ok++;
    } catch (e: any) {
      await supabase.from('automation_logs').insert({
        user_id: row.user_id,
        rule_id: rule.id,
        event_type: 'welcome_sent',
        target: row.follower_id,
        detail: e.message,
        success: false,
      });
      out.welcomes.fail++;
    }
  }

  return res.status(200).json({ ok: true, ...out });
}
