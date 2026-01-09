
-- Phase 1: Supprimer les tables créées précédemment dans app_users (si elles existent)
DROP TABLE IF EXISTS app_users.user_hashtags CASCADE;
DROP TABLE IF EXISTS app_users.social_likes CASCADE;
DROP TABLE IF EXISTS app_users.social_comments CASCADE;
DROP TABLE IF EXISTS app_users.social_posts CASCADE;
DROP TABLE IF EXISTS app_users.user_geo_data CASCADE;
DROP TABLE IF EXISTS app_users.friend_requests CASCADE;
DROP TABLE IF EXISTS app_users.friendships CASCADE;
DROP TABLE IF EXISTS app_users.user_follows CASCADE;
DROP TABLE IF EXISTS app_users.documents CASCADE;
DROP TABLE IF EXISTS app_users.kyc_requests CASCADE;

-- Phase 2: Créer les tables dans app_users en référençant public.users
-- Table kyc_requests
CREATE TABLE app_users.kyc_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid
);

-- Table documents
CREATE TABLE app_users.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kyc_id uuid NOT NULL REFERENCES app_users.kyc_requests(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('ID', 'Passport', 'License')),
  file_path text NOT NULL,
  upload_date timestamp with time zone NOT NULL DEFAULT now()
);

-- Table user_follows
CREATE TABLE app_users.user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Table friendships
CREATE TABLE app_users.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_1 uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_id_2 uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id_1, user_id_2),
  CHECK (user_id_1 < user_id_2)
);

-- Table friend_requests
CREATE TABLE app_users.friend_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(sender_id, receiver_id),
  CHECK (sender_id != receiver_id)
);

-- Table user_geo_data
CREATE TABLE app_users.user_geo_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  ip_address inet,
  country_code varchar(2),
  country_name varchar(100),
  city varchar(100),
  region varchar(100),
  continent_name varchar(50),
  currency_code varchar(3),
  currency_symbol varchar(5),
  calling_code varchar(10),
  carrier_name varchar(100),
  asn_name varchar(200),
  time_zone_name varchar(50),
  is_threat boolean DEFAULT false,
  is_known_abuser boolean DEFAULT false,
  is_safe_user boolean DEFAULT true,
  geo_label text,
  time_zone_current_time timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table social_posts
CREATE TABLE app_users.social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  image_urls jsonb DEFAULT '[]',
  gif_url text,
  tags jsonb DEFAULT '[]',
  post_type text DEFAULT 'general',
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table social_comments
CREATE TABLE app_users.social_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES app_users.social_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  parent_id uuid REFERENCES app_users.social_comments(id) ON DELETE CASCADE,
  likes_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table social_likes
CREATE TABLE app_users.social_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_id uuid REFERENCES app_users.social_posts(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES app_users.social_comments(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL)),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id)
);

-- Table user_hashtags
CREATE TABLE app_users.user_hashtags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  hashtag text NOT NULL,
  usage_count integer DEFAULT 1,
  last_used_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, hashtag)
);

-- Phase 3: Migrer SEULEMENT les données des tables qui existent
-- Migrer kyc_requests (si elle existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'kyc_requests') THEN
        INSERT INTO app_users.kyc_requests (id, user_id, status, submitted_at, reviewed_at, reviewed_by)
        SELECT id, user_id, status::text, submitted_at, reviewed_at, reviewed_by
        FROM public.kyc_requests 
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- Migrer documents (si elle existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'documents') THEN
        INSERT INTO app_users.documents (id, kyc_id, type, file_path, upload_date)
        SELECT id, kyc_id, type::text, file_path, upload_date
        FROM public.documents 
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- Migrer friendships (si elle existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'friendships') THEN
        INSERT INTO app_users.friendships (id, user_id_1, user_id_2, created_at)
        SELECT id, user_id_1, user_id_2, created_at
        FROM public.friendships 
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- Migrer friendship_requests vers friend_requests (si elle existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'friendship_requests') THEN
        INSERT INTO app_users.friend_requests (id, sender_id, receiver_id, status, created_at, updated_at)
        SELECT id, sender_id, receiver_id, status::text, created_at, COALESCE(updated_at, created_at)
        FROM public.friendship_requests 
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- Migrer user_geo_data (elle existe selon les logs)
INSERT INTO app_users.user_geo_data (
  id, user_id, ip_address, country_code, country_name, city, region,
  continent_name, currency_code, currency_symbol, calling_code, carrier_name,
  asn_name, time_zone_name, is_threat, is_known_abuser, is_safe_user,
  geo_label, time_zone_current_time, created_at, updated_at
)
SELECT 
  id, user_id, ip_address, country_code, country_name, city, region,
  continent_name, currency_code, currency_symbol, calling_code, carrier_name,
  asn_name, time_zone_name, 
  COALESCE(is_threat, false) as is_threat,
  COALESCE(is_known_abuser, false) as is_known_abuser,
  COALESCE(is_safe_user, true) as is_safe_user,
  geo_label, time_zone_current_time, created_at, updated_at
FROM public.user_geo_data 
ON CONFLICT (id) DO NOTHING;

-- Migrer social_posts (si elle existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'social_posts') THEN
        INSERT INTO app_users.social_posts (
          id, user_id, content, image_urls, gif_url, tags, post_type,
          likes_count, comments_count, shares_count, created_at, updated_at
        )
        SELECT 
          id, user_id, content, 
          COALESCE(image_urls, '[]'::jsonb) as image_urls,
          gif_url,
          COALESCE(tags, '[]'::jsonb) as tags,
          COALESCE(post_type, 'general') as post_type,
          COALESCE(likes_count, 0) as likes_count,
          COALESCE(comments_count, 0) as comments_count,
          COALESCE(shares_count, 0) as shares_count,
          created_at, updated_at
        FROM public.social_posts 
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- Phase 4: Créer les index nécessaires
CREATE INDEX idx_app_users_kyc_user_id ON app_users.kyc_requests(user_id);
CREATE INDEX idx_app_users_documents_kyc_id ON app_users.documents(kyc_id);
CREATE INDEX idx_app_users_follows_follower ON app_users.user_follows(follower_id);
CREATE INDEX idx_app_users_follows_following ON app_users.user_follows(following_id);
CREATE INDEX idx_app_users_friendships_user1 ON app_users.friendships(user_id_1);
CREATE INDEX idx_app_users_friendships_user2 ON app_users.friendships(user_id_2);
CREATE INDEX idx_app_users_friend_requests_sender ON app_users.friend_requests(sender_id);
CREATE INDEX idx_app_users_friend_requests_receiver ON app_users.friend_requests(receiver_id);
CREATE INDEX idx_app_users_geo_user_id ON app_users.user_geo_data(user_id);
CREATE INDEX idx_app_users_geo_country ON app_users.user_geo_data(country_code);
CREATE INDEX idx_app_users_social_posts_user ON app_users.social_posts(user_id);
CREATE INDEX idx_app_users_social_posts_created ON app_users.social_posts(created_at DESC);
CREATE INDEX idx_app_users_social_comments_post ON app_users.social_comments(post_id);
CREATE INDEX idx_app_users_social_comments_user ON app_users.social_comments(user_id);
CREATE INDEX idx_app_users_social_likes_post ON app_users.social_likes(post_id);
CREATE INDEX idx_app_users_social_likes_comment ON app_users.social_likes(comment_id);
CREATE INDEX idx_app_users_hashtags_user ON app_users.user_hashtags(user_id);
CREATE INDEX idx_app_users_hashtags_tag ON app_users.user_hashtags(hashtag);

-- Phase 5: Activer RLS sur toutes les tables
ALTER TABLE app_users.kyc_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users.user_geo_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users.social_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users.social_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users.user_hashtags ENABLE ROW LEVEL SECURITY;

-- Phase 6: Créer les politiques RLS
-- Politiques pour kyc_requests
CREATE POLICY "Users can view their own KYC requests" ON app_users.kyc_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own KYC requests" ON app_users.kyc_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all KYC requests" ON app_users.kyc_requests
  FOR ALL USING (auth.role() = 'service_role');

-- Politiques pour documents
CREATE POLICY "Users can view their own documents" ON app_users.documents
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM app_users.kyc_requests WHERE id = kyc_id)
  );

CREATE POLICY "Service role can manage all documents" ON app_users.documents
  FOR ALL USING (auth.role() = 'service_role');

-- Politiques pour user_follows
CREATE POLICY "Users can view follows" ON app_users.user_follows
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own follows" ON app_users.user_follows
  FOR ALL USING (auth.uid() = follower_id);

-- Politiques pour friendships
CREATE POLICY "Users can view friendships" ON app_users.friendships
  FOR SELECT USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

CREATE POLICY "Service role can manage friendships" ON app_users.friendships
  FOR ALL USING (auth.role() = 'service_role');

-- Politiques pour friend_requests
CREATE POLICY "Users can view their friend requests" ON app_users.friend_requests
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create friend requests" ON app_users.friend_requests
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their friend requests" ON app_users.friend_requests
  FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Politiques pour user_geo_data
CREATE POLICY "Users can view their own geo data" ON app_users.user_geo_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage geo data" ON app_users.user_geo_data
  FOR ALL USING (auth.role() = 'service_role');

-- Politiques pour social_posts
CREATE POLICY "Users can view public posts" ON app_users.social_posts
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own posts" ON app_users.social_posts
  FOR ALL USING (auth.uid() = user_id);

-- Politiques pour social_comments
CREATE POLICY "Users can view comments" ON app_users.social_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own comments" ON app_users.social_comments
  FOR ALL USING (auth.uid() = user_id);

-- Politiques pour social_likes
CREATE POLICY "Users can view likes" ON app_users.social_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own likes" ON app_users.social_likes
  FOR ALL USING (auth.uid() = user_id);

-- Politiques pour user_hashtags
CREATE POLICY "Users can view hashtags" ON app_users.user_hashtags
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own hashtags" ON app_users.user_hashtags
  FOR ALL USING (auth.uid() = user_id);
