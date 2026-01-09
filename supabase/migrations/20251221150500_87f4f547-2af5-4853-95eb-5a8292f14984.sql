-- Modify the highlight_comments constraint to allow GIF-only comments
ALTER TABLE social_post.highlight_comments 
DROP CONSTRAINT IF EXISTS highlight_comments_content_check;

ALTER TABLE social_post.highlight_comments 
ADD CONSTRAINT highlight_comments_content_check 
CHECK (
  (char_length(content) >= 1 AND char_length(content) <= 1000) 
  OR gif_data IS NOT NULL
);