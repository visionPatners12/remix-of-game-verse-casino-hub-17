-- Add denormalized columns to social_post.selections for faster display
ALTER TABLE social_post.selections 
ADD COLUMN starts_at timestamp with time zone;

ALTER TABLE social_post.selections 
ADD COLUMN league_name text;

ALTER TABLE social_post.selections 
ADD COLUMN league_logo text;

ALTER TABLE social_post.selections 
ADD COLUMN home_team_name text;

ALTER TABLE social_post.selections 
ADD COLUMN home_team_image text;

ALTER TABLE social_post.selections 
ADD COLUMN away_team_name text;

ALTER TABLE social_post.selections 
ADD COLUMN away_team_image text;

-- Index for filtering/sorting by match date
CREATE INDEX idx_selections_starts_at ON social_post.selections(starts_at) 
WHERE starts_at IS NOT NULL;

-- Documentation comments
COMMENT ON COLUMN social_post.selections.starts_at IS 'Date et heure de début du match';
COMMENT ON COLUMN social_post.selections.league_name IS 'Nom de la league (dénormalisé)';
COMMENT ON COLUMN social_post.selections.league_logo IS 'Logo de la league (dénormalisé)';
COMMENT ON COLUMN social_post.selections.home_team_name IS 'Nom équipe domicile (dénormalisé)';
COMMENT ON COLUMN social_post.selections.home_team_image IS 'Image équipe domicile (dénormalisé)';
COMMENT ON COLUMN social_post.selections.away_team_name IS 'Nom équipe extérieur (dénormalisé)';
COMMENT ON COLUMN social_post.selections.away_team_image IS 'Image équipe extérieur (dénormalisé)';