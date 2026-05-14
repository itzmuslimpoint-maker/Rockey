import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { getSupabase } from '../_lib/supabase';
import {
  sendDM,
  replyToComment,
  privateReplyToComment,
  generateAIReply,
} from '../_lib/instagram-api';

/**
 * Instagram (Meta) webhook receiver.
 *
 * GET  → handshake verification (Meta sends hub.challenge once)
 * POST → real events (messages, comments, follows, mentions)
 *
 * Set these env vars on Vercel:
 *   META_VERIFY_TOKEN     — any random string; paste the same value into Meta App
 *   META_APP_SECRET       — your App Secret, used to verify x-hub-signature-256
 */
export const config = { api: { bodyParser: false } };

async function readRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ── GET: webhook verification ─────────────────────────────────────────
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
      return res.status(200).send(String(challenge));
    }
    return res.status(403).send('Forbidden');
  }

  if (req.method !== 'POST') return res.status(405).end();

  // ── POST: signature verification ──────────────────────────────────────
  const raw = await readRawBody(req);
  const signature = String(req.headers['x-hub-signature-256'] || '');
  const appSecret = process.env.META_APP_SECRET;
  if (appSecret && signature.startsWith('sha256=')) {
    const expected =
      'sha256=' + crypto.createHmac('sha256', appSecret).update(raw).digest('hex');
    if (
      expected.length !== signature.length ||
      !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
    ) {
      console.warn('[webhook] invalid signature');
      return res.status(401).send('invalid signature');
    }
  }

  let body: any;
  try {
    body = JSON.parse(raw.toString('utf8'));
  } catch {
    return res.status(400).send('bad json');
  }

  // ALWAYS 200 quickly so Meta doesn't retry.
  res.status(200).json({ received: true });

  // Process asynchronously (function continues running on Vercel for ~10s).
  try {
    await processEntries(body);
  } catch (e) {
    console.error('[webhook] processing error:', e);
  }
}

async function processEntries(body: any) {
  if (!body?.entry || !Array.isArray(body.entry)) return;
  const supabase = getSupabase();
  if (!supabase) return;

  for (const entry of body.entry) {
    // Find the IG account. Webhooks deliver on the Page id (`entry.id`)
    // or on the IG user id depending on the field. Look up by either.
    const entryId = String(entry.id);
    const { data: account } = await supabase
      .from('instagram_accounts')
      .select('*')
      .or(`page_id.eq.${entryId},ig_user_id.eq.${entryId}`)
      .maybeSingle();

    if (!account) {
      console.warn('[webhook] no account matched entryId=', entryId);
      continue;
    }

    // ── DM events ──────────────────────────────────────────────────
    if (entry.messaging) {
      for (const ev of entry.messaging) {
        await handleMessagingEvent(supabase, account, ev);
      }
    }

    // ── Comment / mention events ──────────────────────────────────
    if (entry.changes) {
      for (const change of entry.changes) {
        if (change.field === 'comments') {
          await handleCommentEvent(supabase, account, change.value);
        }
      }
    }
  }
}

async function handleMessagingEvent(supabase: any, account: any, ev: any) {
  // Ignore echoes of our own messages.
  if (ev.message?.is_echo) return;
  const senderId = ev.sender?.id;
  const recipientId = ev.recipient?.id;
  const text: string = ev.message?.text || '';
  const messageId = ev.message?.mid;
  if (!senderId || !text || !messageId) return;

  // Persist the inbound DM
  await supabase.from('instagram_messages').upsert(
    {
      user_id: account.user_id,
      message_id: messageId,
      sender_id: senderId,
      recipient_id: recipientId,
      message: text,
      created_time: new Date(ev.timestamp || Date.now()).toISOString(),
    },
    { onConflict: 'message_id' }
  );

  // Find a matching DM-keyword rule
  const { data: rules } = await supabase
    .from('automation_rules')
    .select('*')
    .eq('user_id', account.user_id)
    .eq('trigger_type', 'dm_keyword')
    .eq('is_active', true);

  const rule = (rules || []).find((r: any) => {
    if (!r.keyword) return true; // no keyword → match anything
    return text.toLowerCase().includes(String(r.keyword).toLowerCase());
  });
  if (!rule) return;

  // Build the reply
  let reply = rule.reply_message || '';
  if (rule.use_ai) {
    const ai = await generateAIReply({
      prompt: `User said: "${text}". Reply naturally and helpfully.`,
      persona: rule.ai_persona,
    });
    if (ai) reply = ai;
  }
  if (!reply) return;

  try {
    await sendDM({
      igUserId: account.ig_user_id,
      recipientId: senderId,
      text: reply,
      pageAccessToken: account.access_token,
    });
    await logAndIncrement(supabase, account.user_id, rule.id, {
      event_type: 'dm_sent',
      target: senderId,
      detail: reply.slice(0, 200),
    });
  } catch (e: any) {
    await logAndIncrement(supabase, account.user_id, rule.id, {
      event_type: 'dm_sent',
      target: senderId,
      detail: e.message,
      success: false,
    });
  }
}

async function handleCommentEvent(supabase: any, account: any, value: any) {
  const commentId = value?.id;
  const mediaId = value?.media?.id;
  const text: string = value?.text || '';
  const fromId = value?.from?.id;
  const fromUsername = value?.from?.username;
  if (!commentId || !text) return;

  await supabase.from('instagram_comments').upsert(
    {
      user_id: account.user_id,
      comment_id: commentId,
      media_id: mediaId,
      from_user_id: fromId,
      from_username: fromUsername,
      text,
      created_time: new Date().toISOString(),
    },
    { onConflict: 'comment_id' }
  );

  // Don't reply to our own comments.
  if (fromId && fromId === account.ig_user_id) return;

  const { data: rules } = await supabase
    .from('automation_rules')
    .select('*')
    .eq('user_id', account.user_id)
    .in('trigger_type', ['comment_keyword', 'comment_to_dm'])
    .eq('is_active', true);

  const matching = (rules || []).filter((r: any) => {
    if (r.media_id && r.media_id !== mediaId) return false;
    if (r.keyword && !text.toLowerCase().includes(String(r.keyword).toLowerCase())) return false;
    return true;
  });

  for (const rule of matching) {
    let reply = rule.reply_message || '';
    if (rule.use_ai) {
      const ai = await generateAIReply({
        prompt: `Someone commented "${text}" on our Instagram post. Reply briefly.`,
        persona: rule.ai_persona,
      });
      if (ai) reply = ai;
    }

    // 1. Public reply
    if (reply) {
      try {
        await replyToComment({
          commentId,
          message: reply,
          pageAccessToken: account.access_token,
        });
        await logAndIncrement(supabase, account.user_id, rule.id, {
          event_type: 'comment_replied',
          target: commentId,
          detail: reply.slice(0, 200),
        });
      } catch (e: any) {
        await logAndIncrement(supabase, account.user_id, rule.id, {
          event_type: 'comment_replied',
          target: commentId,
          detail: e.message,
          success: false,
        });
      }
    }

    // 2. Optional private DM (comment_to_dm or extra dm_message on comment_keyword)
    if (rule.dm_message) {
      try {
        await privateReplyToComment({
          igUserId: account.ig_user_id,
          commentId,
          text: rule.dm_message,
          pageAccessToken: account.access_token,
        });
        await logAndIncrement(supabase, account.user_id, rule.id, {
          event_type: 'dm_sent',
          target: commentId,
          detail: rule.dm_message.slice(0, 200),
        });
      } catch (e: any) {
        await logAndIncrement(supabase, account.user_id, rule.id, {
          event_type: 'dm_sent',
          target: commentId,
          detail: e.message,
          success: false,
        });
      }
    }
  }
}

async function logAndIncrement(
  supabase: any,
  userId: string,
  ruleId: string,
  event: { event_type: string; target?: string; detail?: string; success?: boolean }
) {
  await supabase.from('automation_logs').insert({
    user_id: userId,
    rule_id: ruleId,
    event_type: event.event_type,
    target: event.target,
    detail: event.detail,
    success: event.success ?? true,
  });
  if (event.success !== false) {
    // increment fired_count via RPC-less trick
    const { data: row } = await supabase
      .from('automation_rules')
      .select('fired_count')
      .eq('id', ruleId)
      .maybeSingle();
    await supabase
      .from('automation_rules')
      .update({
        fired_count: (row?.fired_count || 0) + 1,
        last_fired_at: new Date().toISOString(),
      })
      .eq('id', ruleId);
  }
}
