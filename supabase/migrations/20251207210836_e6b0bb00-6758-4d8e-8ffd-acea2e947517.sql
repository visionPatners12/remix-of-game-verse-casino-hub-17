-- Add 8 JSONB columns to sports_data.match for consolidated match data
ALTER TABLE sports_data.match
ADD COLUMN IF NOT EXISTS venue jsonb,
ADD COLUMN IF NOT EXISTS referee jsonb,
ADD COLUMN IF NOT EXISTS forecast jsonb,
ADD COLUMN IF NOT EXISTS events jsonb,
ADD COLUMN IF NOT EXISTS statistics jsonb,
ADD COLUMN IF NOT EXISTS shots jsonb,
ADD COLUMN IF NOT EXISTS news jsonb,
ADD COLUMN IF NOT EXISTS predictions jsonb;

-- Add last_data_fetch timestamp for intelligent caching
ALTER TABLE sports_data.match
ADD COLUMN IF NOT EXISTS last_data_fetch timestamp with time zone;

-- Add comment for documentation
COMMENT ON COLUMN sports_data.match.venue IS 'Stadium info: {name, city, capacity}';
COMMENT ON COLUMN sports_data.match.referee IS 'Referee info: {name, nationality}';
COMMENT ON COLUMN sports_data.match.forecast IS 'Weather forecast: {status, temperature}';
COMMENT ON COLUMN sports_data.match.events IS 'Match events array: goals, cards, substitutions';
COMMENT ON COLUMN sports_data.match.statistics IS 'Team statistics: {home: {...}, away: {...}}';
COMMENT ON COLUMN sports_data.match.shots IS 'Shot data array from match';
COMMENT ON COLUMN sports_data.match.news IS 'Related news articles array';
COMMENT ON COLUMN sports_data.match.predictions IS 'Match predictions data';
COMMENT ON COLUMN sports_data.match.last_data_fetch IS 'Timestamp of last data fetch for caching';