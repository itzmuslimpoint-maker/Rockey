import { createClient } from '@supabase/supabase-js';

const API_VERSION = 'v21.0';

const getSupabase = () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey);
};

/**
 * Sync everything we know about a single Instagram account:
 *   - Profile (username, picture, follower/following count, media count)
 *   - Media (posts, reels, carousels)
 *   - Conversations & messages (for the inbox)
 */
export async function syncInstagramData(
  userId: string,
  accessToken: string,
  igUserId: string,
  pageId: string
) {
  const supabase = getSupabase();
  if (!supabase) {
    console.warn('[sync] Supabase not configured, skipping.');
    return;
  }
  if (!accessToken || !igUserId) {
    console.warn('[sync] Missing accessToken or igUserId, skipping.');
    return;
  }

  console.log(`[sync] Starting for user=${userId}`);

  await fetchAndStoreProfile(supabase, userId, igUserId, accessToken, pageId);
  await fetchAndStoreMedia(supabase, userId, igUserId, accessToken);
  if (pageId) {
    await fetchAndStoreConversations(supabase, userId, pageId, accessToken);
  }

  console.log(`[sync] Done for user=${userId}`);
}

export async function syncAllUsers() {
  const supabase = getSupabase();
  if (!supabase) return;

  const { data: accounts, error } = await supabase
    .from('instagram_accounts')
    .select('user_id, access_token, ig_user_id, page_id');

  if (error) {
    console.error('[sync] failed listing accounts:', error);
    return;
  }
  if (!accounts) return;

  for (const account of accounts) {
    if (!account.access_token || !account.ig_user_id) continue;
    try {
      await syncInstagramData(
        account.user_id,
        account.access_token,
        account.ig_user_id,
        account.page_id
      );
    } catch (e) {
      console.error(`[sync] failed for user=${account.user_id}:`, e);
    }
  }
}

async function fetchAndStoreProfile(
  supabase: any,
  userId: string,
  igUserId: string,
  accessToken: string,
  pageId: string
) {
  try {
    const r = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${igUserId}?fields=username,name,biography,profile_picture_url,followers_count,follows_count,media_count&access_token=${accessToken}`
    );
    const data = await r.json();
    if (data.error) throw new Error(data.error.message);

    const { error } = await supabase.from('instagram_accounts').upsert(
      {
        user_id: userId,
        ig_user_id: igUserId,
        username: data.username,
        name: data.name,
        biography: data.biography,
        profile_picture: data.profile_picture_url,
        followers: data.followers_count,
        following: data.follows_count,
        media_count: data.media_count,
        access_token: accessToken,
        page_id: pageId,
        last_synced_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
    if (error) console.error('[sync] storing profile failed:', error);
  } catch (e) {
    console.error('[sync] fetchAndStoreProfile error:', e);
  }
}

async function fetchAndStoreMedia(
  supabase: any,
  userId: string,
  igUserId: string,
  accessToken: string
) {
  try {
    const r = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${igUserId}/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count&limit=50&access_token=${accessToken}`
    );
    const data = await r.json();
    if (data.error) throw new Error(data.error.message);
    if (!data.data) return;

    for (const item of data.data) {
      const { error } = await supabase.from('instagram_media').upsert(
        {
          user_id: userId,
          media_id: item.id,
          caption: item.caption,
          type: item.media_type,
          url: item.media_url,
          thumbnail_url: item.thumbnail_url,
          permalink: item.permalink,
          like_count: item.like_count,
          comments_count: item.comments_count,
          timestamp: item.timestamp,
        },
        { onConflict: 'media_id' }
      );
      if (error) console.error(`[sync] storing media ${item.id}:`, error);
    }
  } catch (e) {
    console.error('[sync] fetchAndStoreMedia error:', e);
  }
}

async function fetchAndStoreConversations(
  supabase: any,
  userId: string,
  pageId: string,
  accessToken: string
) {
  try {
    const r = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${pageId}/conversations?platform=instagram&fields=id,participants,updated_time,messages.limit(20){id,message,from,to,created_time}&limit=25&access_token=${accessToken}`
    );
    const data = await r.json();
    if (data.error) throw new Error(data.error.message);
    if (!data.data) return;

    for (const conv of data.data) {
      const { error: convErr } = await supabase.from('instagram_conversations').upsert(
        {
          user_id: userId,
          conversation_id: conv.id,
          updated_time: conv.updated_time,
          participants: conv.participants?.data || [],
        },
        { onConflict: 'conversation_id' }
      );
      if (convErr) console.error('[sync] conversation upsert:', convErr);

      if (conv.messages?.data) {
        for (const m of conv.messages.data) {
          const { error: msgErr } = await supabase.from('instagram_messages').upsert(
            {
              user_id: userId,
              message_id: m.id,
              conversation_id: conv.id,
              sender_id: m.from?.id,
              sender_username: m.from?.username,
              recipient_id: m.to?.data?.[0]?.id,
              message: m.message,
              created_time: m.created_time,
            },
            { onConflict: 'message_id' }
          );
          if (msgErr) console.error('[sync] message upsert:', msgErr);
        }
      }
    }
  } catch (e) {
    console.error('[sync] fetchAndStoreConversations error:', e);
  }
}
