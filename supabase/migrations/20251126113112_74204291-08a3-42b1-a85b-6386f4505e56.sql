-- Create match_likes table in social_post schema
CREATE TABLE IF NOT EXISTS social_post.match_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(match_id, user_id)
);

-- Create indexes for match_likes
CREATE INDEX IF NOT EXISTS idx_match_likes_match_id ON social_post.match_likes(match_id);
CREATE INDEX IF NOT EXISTS idx_match_likes_user_id ON social_post.match_likes(user_id);

-- Enable RLS for match_likes
ALTER TABLE social_post.match_likes ENABLE ROW LEVEL SECURITY;

-- RLS policies for match_likes
CREATE POLICY "Anyone can view match likes" ON social_post.match_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own likes" ON social_post.match_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON social_post.match_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Create match_comments table in social_post schema
CREATE TABLE IF NOT EXISTS social_post.match_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  parent_id uuid REFERENCES social_post.match_comments(id),
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for match_comments
CREATE INDEX IF NOT EXISTS idx_match_comments_match_id ON social_post.match_comments(match_id);
CREATE INDEX IF NOT EXISTS idx_match_comments_user_id ON social_post.match_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_match_comments_parent_id ON social_post.match_comments(parent_id);

-- Enable RLS for match_comments
ALTER TABLE social_post.match_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for match_comments
CREATE POLICY "Anyone can view match comments" ON social_post.match_comments
  FOR SELECT USING (is_deleted = false);

CREATE POLICY "Users can insert their own comments" ON social_post.match_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON social_post.match_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION social_post.update_match_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_match_comments_updated_at
  BEFORE UPDATE ON social_post.match_comments
  FOR EACH ROW
  EXECUTE FUNCTION social_post.update_match_comments_updated_at();