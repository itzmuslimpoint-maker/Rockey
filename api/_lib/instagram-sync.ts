import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const getSupabase = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseServiceKey);
};

export async function syncInstagramData(userId: string, accessToken: string, igUserId: string, pageId: string) {
  console.log(`Starting Instagram sync for user ${userId}...`);
  const supabase = getSupabase();
  if (!supabase) {
    console.warn("Supabase not configured, skipping sync.");
    return;
  }

  try {
    const apiVersion = "v21.0";

    // 1. Fetch and Store Profile (Updated to include followers/following and pageId)
    await fetchAndStoreProfile(userId, igUserId, accessToken, apiVersion, pageId);

    // 2. Fetch and Store Media
    await fetchAndStoreMedia(userId, igUserId, accessToken, apiVersion);

    // 3. Fetch and Store Conversations & Messages
    if (pageId) {
      await fetchAndStoreConversations(userId, pageId, accessToken, apiVersion);
    }

    console.log(`Instagram sync completed for user ${userId}`);
  } catch (error) {
    console.error(`Error during Instagram sync for user ${userId}:`, error);
  }
}

export async function syncAllUsers() {
  console.log("Starting global Instagram sync for all users...");
  const supabase = getSupabase();
  if (!supabase) {
    console.warn("Supabase not configured, skipping global sync.");
    return;
  }
  try {
    const { data: accounts, error } = await supabase
      .from("instagram_accounts")
      .select("user_id, access_token, ig_user_id, page_id");

    if (error) throw error;

    if (accounts) {
      for (const account of accounts) {
        await syncInstagramData(account.user_id, account.access_token, account.ig_user_id, account.page_id);
      }
    }
    console.log("Global Instagram sync completed.");
  } catch (error) {
    console.error("Error during global Instagram sync:", error);
  }
}
async function fetchAndStoreProfile(userId: string, igUserId: string, accessToken: string, apiVersion: string, pageId: string) {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    const response = await fetch(`https://graph.facebook.com/${apiVersion}/${igUserId}?fields=username,followers_count,follows_count,profile_picture_url&access_token=${accessToken}`);
    const data = await response.json();

    if (data.error) throw new Error(data.error.message);

    const { error } = await supabase
      .from("instagram_accounts")
      .upsert({
        user_id: userId,
        ig_user_id: igUserId,
        username: data.username,
        profile_picture: data.profile_picture_url,
        followers: data.followers_count,
        following: data.follows_count,
        access_token: accessToken,
        page_id: pageId,
        connected_at: new Date().toISOString()
      }, { onConflict: 'ig_user_id' });

    if (error) console.error("Error storing profile:", error);
    return data;
  } catch (error) {
    console.error("Error fetching profile:", error);
  }
}

async function fetchAndStoreMedia(userId: string, igUserId: string, accessToken: string, apiVersion: string) {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    const response = await fetch(`https://graph.facebook.com/${apiVersion}/${igUserId}/media?fields=id,media_type,media_url,timestamp&access_token=${accessToken}`);
    const data = await response.json();

    if (data.error) throw new Error(data.error.message);

    if (data.data) {
      for (const item of data.data) {
        const { error } = await supabase
          .from("instagram_media")
          .upsert({
            user_id: userId,
            media_id: item.id,
            type: item.media_type,
            url: item.media_url,
            timestamp: item.timestamp
          }, { onConflict: 'media_id' });

        if (error) console.error(`Error storing media ${item.id}:`, error);
      }
    }
  } catch (error) {
    console.error("Error fetching media:", error);
  }
}

async function fetchAndStoreConversations(userId: string, pageId: string, accessToken: string, apiVersion: string) {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    const response = await fetch(`https://graph.facebook.com/${apiVersion}/${pageId}/conversations?fields=messages{message,from,created_time}&access_token=${accessToken}`);
    const data = await response.json();

    if (data.error) throw new Error(data.error.message);

    if (data.data) {
      for (const conv of data.data) {
        if (conv.messages && conv.messages.data) {
          for (const msg of conv.messages.data) {
            const { error } = await supabase
              .from("instagram_messages")
              .upsert({
                user_id: userId,
                sender_id: msg.from?.id,
                message: msg.message,
                timestamp: msg.created_time
              }, { onConflict: 'id' }); // Note: you might need a proper unique ID from Meta if 'id' exists

            if (error) console.error(`Error storing message:`, error);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error fetching conversations:", error);
  }
}
