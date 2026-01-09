-- Table de relations de suivi
CREATE TABLE IF NOT EXISTS social_post.user_follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Empêcher les doublons
  UNIQUE(follower_id, following_id)
);

-- Index basiques pour les requêtes
CREATE INDEX idx_follows_follower ON social_post.user_follows(follower_id);
CREATE INDEX idx_follows_following ON social_post.user_follows(following_id);

-- Activer RLS
ALTER TABLE social_post.user_follows ENABLE ROW LEVEL SECURITY;

-- 1. Tout le monde peut voir les relations
CREATE POLICY "view_follows" ON social_post.user_follows
  FOR SELECT USING (true);

-- 2. Les users peuvent follow (créer)
CREATE POLICY "create_follows" ON social_post.user_follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- 3. Les users peuvent unfollow (supprimer)
CREATE POLICY "delete_follows" ON social_post.user_follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Fonction pour récupérer les stats d'un user
CREATE OR REPLACE FUNCTION social_post.get_follow_stats(user_id UUID)
RETURNS JSON AS $$
  SELECT json_build_object(
    'followers', (SELECT COUNT(*) FROM social_post.user_follows WHERE following_id = user_id),
    'following', (SELECT COUNT(*) FROM social_post.user_follows WHERE follower_id = user_id)
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;