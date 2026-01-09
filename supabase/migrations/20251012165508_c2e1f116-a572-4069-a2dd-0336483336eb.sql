-- Créer la table social_post.simple_posts pour la persistance des posts simples
CREATE TABLE IF NOT EXISTS social_post.simple_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  hashtags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  stream_activity_id TEXT UNIQUE,
  
  -- Métadonnées
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_simple_posts_user_id ON social_post.simple_posts(user_id);
CREATE INDEX idx_simple_posts_stream_activity_id ON social_post.simple_posts(stream_activity_id);
CREATE INDEX idx_simple_posts_created_at ON social_post.simple_posts(created_at DESC);

-- Activer RLS
ALTER TABLE social_post.simple_posts ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Users can view public simple posts"
  ON social_post.simple_posts FOR SELECT
  USING (NOT is_deleted);

CREATE POLICY "Users can create their own simple posts"
  ON social_post.simple_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own simple posts"
  ON social_post.simple_posts FOR UPDATE
  USING (auth.uid() = user_id);

-- Créer la table social_post.simple_post_media pour les médias
CREATE TABLE IF NOT EXISTS social_post.simple_post_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simple_post_id UUID NOT NULL REFERENCES social_post.simple_posts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  storage_path TEXT,
  file_size_bytes BIGINT,
  mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Ordre d'affichage
  position INTEGER NOT NULL DEFAULT 0
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_simple_post_media_post_id ON social_post.simple_post_media(simple_post_id);
CREATE INDEX idx_simple_post_media_position ON social_post.simple_post_media(simple_post_id, position);

-- Activer RLS
ALTER TABLE social_post.simple_post_media ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Anyone can view media from public posts"
  ON social_post.simple_post_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM social_post.simple_posts sp
      WHERE sp.id = simple_post_id AND NOT sp.is_deleted
    )
  );

CREATE POLICY "Users can insert media for their posts"
  ON social_post.simple_post_media FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM social_post.simple_posts sp
      WHERE sp.id = simple_post_id AND sp.user_id = auth.uid()
    )
  );