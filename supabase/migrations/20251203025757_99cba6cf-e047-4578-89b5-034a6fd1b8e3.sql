-- Ajouter la colonne team_id avec FK vers sports_data.teams
ALTER TABLE sports_data.match_statistics 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES sports_data.teams(id);

-- Index pour team_id
CREATE INDEX IF NOT EXISTS idx_match_statistics_team_id ON sports_data.match_statistics(team_id);

-- Trigger pour enrichir team_id depuis team_provider_id
CREATE OR REPLACE FUNCTION sports_data.enrich_match_statistics_team_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.team_id IS NULL AND NEW.team_provider_id IS NOT NULL THEN
    SELECT id INTO NEW.team_id
    FROM sports_data.teams
    WHERE highlightly_id = NEW.team_provider_id
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_match_statistics_enrich_team ON sports_data.match_statistics;
CREATE TRIGGER trg_match_statistics_enrich_team
  BEFORE INSERT OR UPDATE ON sports_data.match_statistics
  FOR EACH ROW
  EXECUTE FUNCTION sports_data.enrich_match_statistics_team_id();