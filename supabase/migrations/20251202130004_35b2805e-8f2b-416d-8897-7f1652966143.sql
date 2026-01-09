-- Create lineups table in sports_data schema
CREATE TABLE sports_data.lineups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign keys to existing tables
  match_id UUID NOT NULL REFERENCES sports_data.match(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES sports_data.teams(id) ON DELETE CASCADE,
  sport_id UUID NOT NULL REFERENCES sports_data.sport(id) ON DELETE CASCADE,
  
  -- Lineup data
  side TEXT NOT NULL CHECK (side IN ('home', 'away')),
  formation TEXT,  -- '4-3-3', '4-2-3-1', etc.
  
  -- JSONB with player data (will be enriched with player_id UUIDs)
  -- Format initial_lineup: [[{provider_id, player_id?, name, number, position}], ...]
  initial_lineup JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Format substitutes: [{provider_id, player_id?, name, number, position}, ...]
  substitutes JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Metadata
  provider TEXT DEFAULT 'highlightly',
  provider_lineup_id BIGINT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  UNIQUE (match_id, team_id),
  UNIQUE (match_id, side)
);

-- Indexes for frequent queries
CREATE INDEX idx_lineups_match_id ON sports_data.lineups(match_id);
CREATE INDEX idx_lineups_team_id ON sports_data.lineups(team_id);
CREATE INDEX idx_lineups_sport_id ON sports_data.lineups(sport_id);

-- Enable RLS
ALTER TABLE sports_data.lineups ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view lineups"
  ON sports_data.lineups
  FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage lineups"
  ON sports_data.lineups
  FOR ALL
  USING (true);

-- Function to enrich player_ids from provider_id
CREATE OR REPLACE FUNCTION sports_data.enrich_lineup_player_ids()
RETURNS TRIGGER AS $$
DECLARE
  row_arr JSONB;
  player_obj JSONB;
  enriched_lineup JSONB := '[]'::JSONB;
  enriched_row JSONB;
  enriched_subs JSONB := '[]'::JSONB;
  player_uuid UUID;
  provider_id_val BIGINT;
BEGIN
  -- Enrich initial_lineup (nested array: rows of players)
  IF NEW.initial_lineup IS NOT NULL AND jsonb_array_length(NEW.initial_lineup) > 0 THEN
    FOR row_arr IN SELECT * FROM jsonb_array_elements(NEW.initial_lineup)
    LOOP
      enriched_row := '[]'::JSONB;
      FOR player_obj IN SELECT * FROM jsonb_array_elements(row_arr)
      LOOP
        -- Get provider_id from either 'provider_id' or 'id' field
        provider_id_val := COALESCE(
          (player_obj->>'provider_id')::BIGINT,
          (player_obj->>'id')::BIGINT
        );
        
        IF provider_id_val IS NOT NULL THEN
          -- Look up player_id from provider_id in players table
          SELECT id INTO player_uuid
          FROM sports_data.players
          WHERE provider_id = provider_id_val
          LIMIT 1;
          
          -- Add player_id if found
          IF player_uuid IS NOT NULL THEN
            player_obj := player_obj || jsonb_build_object('player_id', player_uuid::TEXT);
          END IF;
        END IF;
        
        enriched_row := enriched_row || jsonb_build_array(player_obj);
      END LOOP;
      enriched_lineup := enriched_lineup || jsonb_build_array(enriched_row);
    END LOOP;
    NEW.initial_lineup := enriched_lineup;
  END IF;

  -- Enrich substitutes (flat array of players)
  IF NEW.substitutes IS NOT NULL AND jsonb_array_length(NEW.substitutes) > 0 THEN
    FOR player_obj IN SELECT * FROM jsonb_array_elements(NEW.substitutes)
    LOOP
      -- Get provider_id from either 'provider_id' or 'id' field
      provider_id_val := COALESCE(
        (player_obj->>'provider_id')::BIGINT,
        (player_obj->>'id')::BIGINT
      );
      
      IF provider_id_val IS NOT NULL THEN
        -- Look up player_id from provider_id in players table
        SELECT id INTO player_uuid
        FROM sports_data.players
        WHERE provider_id = provider_id_val
        LIMIT 1;
        
        -- Add player_id if found
        IF player_uuid IS NOT NULL THEN
          player_obj := player_obj || jsonb_build_object('player_id', player_uuid::TEXT);
        END IF;
      END IF;
      
      enriched_subs := enriched_subs || jsonb_build_array(player_obj);
    END LOOP;
    NEW.substitutes := enriched_subs;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-enrich player_ids on insert/update
CREATE TRIGGER trg_enrich_lineup_player_ids
  BEFORE INSERT OR UPDATE ON sports_data.lineups
  FOR EACH ROW
  EXECUTE FUNCTION sports_data.enrich_lineup_player_ids();