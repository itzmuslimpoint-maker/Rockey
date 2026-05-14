-- ============================================================
-- DMflow — Supabase schema
-- Run this in Supabase SQL editor.  Safe to re-run (idempotent).
-- ============================================================

-- 1. Users -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    instagram_connected BOOLEAN DEFAULT FALSE,
    instagram_token TEXT,
    instagram_user_id TEXT,
    plan TEXT DEFAULT 'Free',
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create a public.users row whenever a new auth user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Instagram accounts ---------------------------------------
CREATE TABLE IF NOT EXISTS public.instagram_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    ig_user_id TEXT UNIQUE NOT NULL,
    username TEXT,
    name TEXT,
    biography TEXT,
    profile_picture TEXT,
    followers INTEGER DEFAULT 0,
    following INTEGER DEFAULT 0,
    media_count INTEGER DEFAULT 0,
    access_token TEXT,
    page_id TEXT,
    page_name TEXT,
    connected_at TIMESTAMPTZ DEFAULT now(),
    last_synced_at TIMESTAMPTZ
);

-- 3. Instagram media (cached posts/reels) ---------------------
CREATE TABLE IF NOT EXISTS public.instagram_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    media_id TEXT UNIQUE NOT NULL,
    caption TEXT,
    type TEXT,
    url TEXT,
    thumbnail_url TEXT,
    permalink TEXT,
    like_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    timestamp TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_media_user ON public.instagram_media(user_id);

-- 4. Conversations + messages ---------------------------------
CREATE TABLE IF NOT EXISTS public.instagram_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    conversation_id TEXT UNIQUE NOT NULL,
    participants JSONB,
    updated_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_convs_user ON public.instagram_conversations(user_id);

CREATE TABLE IF NOT EXISTS public.instagram_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    message_id TEXT UNIQUE NOT NULL,
    conversation_id TEXT,
    sender_id TEXT,
    sender_username TEXT,
    recipient_id TEXT,
    message TEXT,
    created_time TIMESTAMPTZ,
    handled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_msgs_user ON public.instagram_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_msgs_conv ON public.instagram_messages(conversation_id);

-- 5. Comments cache -------------------------------------------
CREATE TABLE IF NOT EXISTS public.instagram_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    comment_id TEXT UNIQUE NOT NULL,
    media_id TEXT,
    parent_id TEXT,
    from_user_id TEXT,
    from_username TEXT,
    text TEXT,
    created_time TIMESTAMPTZ,
    handled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_comments_user ON public.instagram_comments(user_id);

-- 6. Automation rules -----------------------------------------
-- One row = one rule. trigger_type drives behavior.
--   'dm_keyword'         → reply to incoming DMs that contain `keyword`
--   'comment_keyword'    → reply to comments that contain `keyword` (and optional DM)
--   'welcome_dm'         → DM new followers
--   'comment_to_dm'      → on comment, send a private DM with `dm_message`
CREATE TABLE IF NOT EXISTS public.automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    trigger_type TEXT NOT NULL,
    keyword TEXT,                    -- nullable; matches anywhere if NULL
    media_id TEXT,                   -- nullable; restrict to one post if set
    reply_message TEXT,              -- public reply text (for comments) or DM body
    dm_message TEXT,                 -- optional follow-up DM for comment_to_dm
    use_ai BOOLEAN DEFAULT FALSE,    -- generate reply via Gemini
    ai_persona TEXT,                 -- system prompt when use_ai is true
    is_active BOOLEAN DEFAULT TRUE,
    fired_count INTEGER DEFAULT 0,
    last_fired_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_rules_user ON public.automation_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_rules_active ON public.automation_rules(is_active);

-- 7. Scheduled posts ------------------------------------------
CREATE TABLE IF NOT EXISTS public.scheduled_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    caption TEXT,
    image_url TEXT,                  -- public URL (Supabase storage / cdn)
    media_type TEXT DEFAULT 'IMAGE', -- IMAGE | VIDEO | REEL
    scheduled_for TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'pending',   -- pending | publishing | published | failed
    error TEXT,
    ig_media_id TEXT,                -- populated after successful publish
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_scheduled_due ON public.scheduled_posts(status, scheduled_for);

-- 8. Followers seen (used to detect new follows for welcome DMs) --
CREATE TABLE IF NOT EXISTS public.instagram_followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    follower_id TEXT NOT NULL,
    welcomed BOOLEAN DEFAULT FALSE,
    first_seen TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, follower_id)
);

-- 9. Automation activity log (for the dashboard timeline) -----
CREATE TABLE IF NOT EXISTS public.automation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES public.automation_rules(id) ON DELETE SET NULL,
    event_type TEXT,                 -- 'dm_sent' | 'comment_replied' | 'welcome_sent' | 'post_published'
    target TEXT,                     -- @username or media_id
    detail TEXT,
    success BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_logs_user ON public.automation_logs(user_id, created_at DESC);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE public.users                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_accounts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_media          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_conversations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_messages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_comments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_posts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_followers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs          ENABLE ROW LEVEL SECURITY;

-- A small helper macro: same SELECT/INSERT/UPDATE/DELETE policy for owner-only.
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN SELECT unnest(ARRAY[
        'instagram_accounts','instagram_media','instagram_conversations',
        'instagram_messages','instagram_comments','automation_rules',
        'scheduled_posts','instagram_followers','automation_logs'
    ]) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I_owner_select   ON public.%I', t, t);
        EXECUTE format('DROP POLICY IF EXISTS %I_owner_insert   ON public.%I', t, t);
        EXECUTE format('DROP POLICY IF EXISTS %I_owner_update   ON public.%I', t, t);
        EXECUTE format('DROP POLICY IF EXISTS %I_owner_delete   ON public.%I', t, t);
        EXECUTE format('CREATE POLICY %I_owner_select ON public.%I FOR SELECT USING (auth.uid() = user_id)', t, t);
        EXECUTE format('CREATE POLICY %I_owner_insert ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id)', t, t);
        EXECUTE format('CREATE POLICY %I_owner_update ON public.%I FOR UPDATE USING (auth.uid() = user_id)', t, t);
        EXECUTE format('CREATE POLICY %I_owner_delete ON public.%I FOR DELETE USING (auth.uid() = user_id)', t, t);
    END LOOP;
END $$;

-- users-table policies (different because pk is `id`, not `user_id`)
DROP POLICY IF EXISTS users_owner_select ON public.users;
DROP POLICY IF EXISTS users_owner_update ON public.users;
DROP POLICY IF EXISTS users_owner_insert ON public.users;
CREATE POLICY users_owner_select ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_owner_update ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY users_owner_insert ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
