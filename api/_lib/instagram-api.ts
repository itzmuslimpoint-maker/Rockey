/**
 * Thin wrapper around the Instagram Graph API.
 * Centralises the API version + auth so route handlers stay clean.
 */
const API_VERSION = 'v21.0';
const BASE = `https://graph.facebook.com/${API_VERSION}`;

export async function sendDM(opts: {
  igUserId: string;       // sender (your IG Business id)
  recipientId: string;    // the user we're DMing
  text: string;
  pageAccessToken: string;
}) {
  const r = await fetch(`${BASE}/${opts.igUserId}/messages?access_token=${opts.pageAccessToken}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipient: { id: opts.recipientId },
      message: { text: opts.text },
    }),
  });
  const json = await r.json();
  if (!r.ok || json.error) throw new Error(json.error?.message || 'sendDM failed');
  return json;
}

export async function replyToComment(opts: {
  commentId: string;
  message: string;
  pageAccessToken: string;
}) {
  const r = await fetch(`${BASE}/${opts.commentId}/replies?access_token=${opts.pageAccessToken}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: opts.message }),
  });
  const json = await r.json();
  if (!r.ok || json.error) throw new Error(json.error?.message || 'replyToComment failed');
  return json;
}

/** Send a private DM in response to a comment (Instagram private replies) */
export async function privateReplyToComment(opts: {
  igUserId: string;
  commentId: string;
  text: string;
  pageAccessToken: string;
}) {
  const r = await fetch(`${BASE}/${opts.igUserId}/messages?access_token=${opts.pageAccessToken}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipient: { comment_id: opts.commentId },
      message: { text: opts.text },
    }),
  });
  const json = await r.json();
  if (!r.ok || json.error) throw new Error(json.error?.message || 'privateReplyToComment failed');
  return json;
}

/** Create a media container, then publish it. Returns the new IG media id. */
export async function publishImage(opts: {
  igUserId: string;
  imageUrl: string;
  caption?: string;
  pageAccessToken: string;
}): Promise<string> {
  // 1. Create container
  const createUrl =
    `${BASE}/${opts.igUserId}/media?image_url=${encodeURIComponent(opts.imageUrl)}` +
    (opts.caption ? `&caption=${encodeURIComponent(opts.caption)}` : '') +
    `&access_token=${opts.pageAccessToken}`;
  const cr = await fetch(createUrl, { method: 'POST' });
  const cj = await cr.json();
  if (!cr.ok || cj.error) throw new Error(cj.error?.message || 'publishImage:create failed');

  // 2. Publish container
  const pubUrl = `${BASE}/${opts.igUserId}/media_publish?creation_id=${cj.id}&access_token=${opts.pageAccessToken}`;
  const pr = await fetch(pubUrl, { method: 'POST' });
  const pj = await pr.json();
  if (!pr.ok || pj.error) throw new Error(pj.error?.message || 'publishImage:publish failed');
  return pj.id;
}

/** Generate a reply with Gemini. Returns plain text. */
export async function generateAIReply(opts: {
  prompt: string;
  persona?: string;
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return '';
  const sys = opts.persona ||
    'You are a friendly Instagram assistant. Reply in 1-2 short, warm sentences. No hashtags.';

  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: opts.prompt }] }],
        systemInstruction: { parts: [{ text: sys }] },
        generationConfig: { temperature: 0.7, maxOutputTokens: 120 },
      }),
    }
  );
  const j = await r.json();
  return j?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}
