-- Add gif_data column to highlight_comments table
ALTER TABLE social_post.highlight_comments
ADD COLUMN gif_data JSONB DEFAULT NULL;

-- Add gif_data column to match_comments table  
ALTER TABLE social_post.match_comments
ADD COLUMN gif_data JSONB DEFAULT NULL;

-- Add comments to describe the structure
COMMENT ON COLUMN social_post.highlight_comments.gif_data IS 'JSON object containing: url (string), previewUrl (string), width (number), height (number), alt (string)';
COMMENT ON COLUMN social_post.match_comments.gif_data IS 'JSON object containing: url (string), previewUrl (string), width (number), height (number), alt (string)';