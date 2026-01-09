-- Migration: Convert match_likes and match_comments to use UUID with foreign keys

-- 1. Add new UUID column to match_likes
ALTER TABLE social_post.match_likes 
  ADD COLUMN match_uuid uuid;

-- 2. Add new UUID column to match_comments
ALTER TABLE social_post.match_comments 
  ADD COLUMN match_uuid uuid;

-- 3. Populate match_uuid from stg_azuro_games lookup
UPDATE social_post.match_likes ml
SET match_uuid = sag.id
FROM sports_data.stg_azuro_games sag
WHERE ml.match_id = sag.azuro_game_id;

UPDATE social_post.match_comments mc
SET match_uuid = sag.id
FROM sports_data.stg_azuro_games sag
WHERE mc.match_id = sag.azuro_game_id;

-- 4. Delete orphan records (where no match was found)
DELETE FROM social_post.match_likes WHERE match_uuid IS NULL;
DELETE FROM social_post.match_comments WHERE match_uuid IS NULL;

-- 5. Drop old match_id column
ALTER TABLE social_post.match_likes DROP COLUMN match_id;
ALTER TABLE social_post.match_comments DROP COLUMN match_id;

-- 6. Rename match_uuid to match_id
ALTER TABLE social_post.match_likes RENAME COLUMN match_uuid TO match_id;
ALTER TABLE social_post.match_comments RENAME COLUMN match_uuid TO match_id;

-- 7. Add NOT NULL constraint
ALTER TABLE social_post.match_likes 
  ALTER COLUMN match_id SET NOT NULL;

ALTER TABLE social_post.match_comments 
  ALTER COLUMN match_id SET NOT NULL;

-- 8. Create foreign keys to stg_azuro_games
ALTER TABLE social_post.match_likes
  ADD CONSTRAINT fk_match_likes_stg_game
  FOREIGN KEY (match_id) REFERENCES sports_data.stg_azuro_games(id)
  ON DELETE CASCADE;

ALTER TABLE social_post.match_comments
  ADD CONSTRAINT fk_match_comments_stg_game
  FOREIGN KEY (match_id) REFERENCES sports_data.stg_azuro_games(id)
  ON DELETE CASCADE;

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_match_likes_match_id ON social_post.match_likes(match_id);
CREATE INDEX IF NOT EXISTS idx_match_comments_match_id ON social_post.match_comments(match_id);