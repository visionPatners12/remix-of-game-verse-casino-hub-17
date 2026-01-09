-- Add American Football specific columns to sports_data.match
ALTER TABLE sports_data.match 
ADD COLUMN IF NOT EXISTS box_scores jsonb,
ADD COLUMN IF NOT EXISTS top_performers jsonb,
ADD COLUMN IF NOT EXISTS injuries jsonb;

COMMENT ON COLUMN sports_data.match.box_scores IS 'American Football: per-player stats by team';
COMMENT ON COLUMN sports_data.match.top_performers IS 'American Football: top performers by stat category';
COMMENT ON COLUMN sports_data.match.injuries IS 'American Football: team injury lists';