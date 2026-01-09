-- Add foreign key constraint on highlight_likes.highlight_id
ALTER TABLE social_post.highlight_likes
ADD CONSTRAINT fk_highlight_likes_highlight
FOREIGN KEY (highlight_id) REFERENCES sports_data.highlights(id) ON DELETE CASCADE;

-- Add foreign key constraint on highlight_comments.highlight_id
ALTER TABLE social_post.highlight_comments
ADD CONSTRAINT fk_highlight_comments_highlight
FOREIGN KEY (highlight_id) REFERENCES sports_data.highlights(id) ON DELETE CASCADE;