
-- Migration: Déplacer les tables sociales vers le schéma app_social
-- Vérifier et déplacer les tables existantes du schéma public vers app_social

-- Social Posts
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'social_posts') THEN
    ALTER TABLE public.social_posts SET SCHEMA app_social;
  END IF;
END $$;

-- User Follows
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_follows') THEN
    ALTER TABLE public.user_follows SET SCHEMA app_social;
  END IF;
END $$;

-- Follow Requests
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'follow_requests') THEN
    ALTER TABLE public.follow_requests SET SCHEMA app_social;
  END IF;
END $$;

-- Friendship Requests
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'friendship_requests') THEN
    ALTER TABLE public.friendship_requests SET SCHEMA app_social;
  END IF;
END $$;

-- Friendships
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'friendships') THEN
    ALTER TABLE public.friendships SET SCHEMA app_social;
  END IF;
END $$;

-- Live Streams
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'live_streams') THEN
    ALTER TABLE public.live_streams SET SCHEMA app_social;
  END IF;
END $$;

-- Direct Messages (si elle existe encore dans public)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'direct_messages') THEN
    ALTER TABLE public.direct_messages SET SCHEMA app_social;
  END IF;
END $$;

-- Déplacer aussi les tables de pronostics/forecasts vers app_social
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'forecasts') THEN
    ALTER TABLE public.forecasts SET SCHEMA app_social;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'forecast_posts') THEN
    ALTER TABLE public.forecast_posts SET SCHEMA app_social;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'forecast_earnings') THEN
    ALTER TABLE public.forecast_earnings SET SCHEMA app_social;
  END IF;
END $$;

-- Match Opinions
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'match_opinions') THEN
    ALTER TABLE public.match_opinions SET SCHEMA app_social;
  END IF;
END $$;

-- Hashtags
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'hashtags') THEN
    ALTER TABLE public.hashtags SET SCHEMA app_social;
  END IF;
END $$;

-- Créer les tables manquantes dans app_social si elles n'existent pas encore
CREATE TABLE IF NOT EXISTS app_social.social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  image_urls JSONB DEFAULT '[]'::jsonb,
  gif_url TEXT,
  post_type TEXT DEFAULT 'general',
  stream_activity_id TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_social.user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS app_social.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_1 UUID NOT NULL,
  user_id_2 UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT friendships_ordered_users CHECK (user_id_1 < user_id_2)
);

CREATE TABLE IF NOT EXISTS app_social.friendship_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_social.follow_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_social.direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_social.forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  match_id BIGINT NOT NULL,
  market_id INTEGER NOT NULL,
  label TEXT NOT NULL,
  probability NUMERIC NOT NULL,
  calculated_odds NUMERIC NOT NULL,
  confidence_level TEXT CHECK (confidence_level IN ('low', 'medium', 'high')),
  handicap NUMERIC,
  total NUMERIC,
  analysis TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  is_premium BOOLEAN DEFAULT FALSE,
  price NUMERIC,
  currency TEXT DEFAULT 'USD',
  preview_text TEXT,
  hashtags JSONB DEFAULT '[]'::jsonb,
  is_resolved BOOLEAN DEFAULT FALSE,
  result TEXT,
  resolved_at TIMESTAMPTZ,
  performance_score NUMERIC DEFAULT 0,
  purchases_count INTEGER DEFAULT 0,
  revenue_generated NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_social.forecast_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  forecast_id UUID NOT NULL REFERENCES app_social.forecasts(id),
  stream_activity_id TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_social.forecast_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_id UUID NOT NULL REFERENCES app_social.forecasts(id),
  creator_id UUID NOT NULL,
  buyer_id UUID NOT NULL,
  gross_amount NUMERIC NOT NULL,
  creator_earnings NUMERIC NOT NULL,
  platform_fee NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_social.live_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  streamer_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended')),
  viewer_count INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  hashtags JSONB DEFAULT '[]'::jsonb,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_social.match_opinions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  match_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  hashtags JSONB DEFAULT '[]'::jsonb,
  mentioned_players JSONB DEFAULT '[]'::jsonb,
  stream_activity_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_social.hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  usage_count INTEGER DEFAULT 0,
  is_trending BOOLEAN DEFAULT FALSE,
  match_id BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON app_social.social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON app_social.social_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON app_social.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON app_social.user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user1 ON app_social.friendships(user_id_1);
CREATE INDEX IF NOT EXISTS idx_friendships_user2 ON app_social.friendships(user_id_2);
CREATE INDEX IF NOT EXISTS idx_forecasts_user_id ON app_social.forecasts(user_id);
CREATE INDEX IF NOT EXISTS idx_forecasts_match_id ON app_social.forecasts(match_id);
CREATE INDEX IF NOT EXISTS idx_match_opinions_match_id ON app_social.match_opinions(match_id);
CREATE INDEX IF NOT EXISTS idx_hashtags_trending ON app_social.hashtags(is_trending, usage_count DESC);

-- Mettre à jour les commentaires des tables
COMMENT ON SCHEMA app_social IS 'Schema pour toutes les fonctionnalités sociales: posts, follows, amitiés, prévisions, opinions';
COMMENT ON TABLE app_social.social_posts IS 'Posts sociaux des utilisateurs';
COMMENT ON TABLE app_social.user_follows IS 'Relations de suivi entre utilisateurs';
COMMENT ON TABLE app_social.friendships IS 'Relations d amitié entre utilisateurs';
COMMENT ON TABLE app_social.forecasts IS 'Prévisions sportives des utilisateurs';
COMMENT ON TABLE app_social.live_streams IS 'Streams en direct des utilisateurs';
