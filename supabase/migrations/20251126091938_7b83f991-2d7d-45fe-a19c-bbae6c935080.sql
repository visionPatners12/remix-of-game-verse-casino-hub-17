-- Create highlight_likes table in social_post schema
CREATE TABLE social_post.highlight_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  highlight_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_highlight_like UNIQUE(highlight_id, user_id)
);

-- Create highlight_comments table in social_post schema
CREATE TABLE social_post.highlight_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  highlight_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 1000),
  parent_id uuid REFERENCES social_post.highlight_comments(id) ON DELETE CASCADE,
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_hl_likes_highlight ON social_post.highlight_likes(highlight_id);
CREATE INDEX idx_hl_likes_user ON social_post.highlight_likes(user_id);
CREATE INDEX idx_hl_likes_created ON social_post.highlight_likes(created_at DESC);

CREATE INDEX idx_hl_comments_highlight ON social_post.highlight_comments(highlight_id);
CREATE INDEX idx_hl_comments_user ON social_post.highlight_comments(user_id);
CREATE INDEX idx_hl_comments_parent ON social_post.highlight_comments(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_hl_comments_created ON social_post.highlight_comments(created_at DESC);

-- Enable Row Level Security
ALTER TABLE social_post.highlight_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post.highlight_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for highlight_likes
CREATE POLICY "Anyone can view likes"
  ON social_post.highlight_likes
  FOR SELECT
  USING (true);

CREATE POLICY "Users can like highlights"
  ON social_post.highlight_likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
  ON social_post.highlight_likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for highlight_comments
CREATE POLICY "Anyone can view comments"
  ON social_post.highlight_comments
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create comments"
  ON social_post.highlight_comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON social_post.highlight_comments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON social_post.highlight_comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at on comments
CREATE TRIGGER set_updated_at_highlight_comments
  BEFORE UPDATE ON social_post.highlight_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();