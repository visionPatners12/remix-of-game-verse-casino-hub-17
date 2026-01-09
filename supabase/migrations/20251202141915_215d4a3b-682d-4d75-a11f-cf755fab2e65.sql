-- Create match_events table in sports_data schema
CREATE TABLE sports_data.match_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- FK vers le match
  match_id UUID NOT NULL REFERENCES sports_data.match(id) ON DELETE CASCADE,
  
  -- Données de l'événement
  event_type TEXT NOT NULL,           -- 'Goal', 'Yellow Card', 'Red Card', 'Substitution', etc.
  event_time TEXT NOT NULL,           -- '45+1', '90', etc. (string car peut contenir +)
  event_minute INTEGER,               -- Minute extraite (pour tri)
  
  -- Équipe impliquée
  team_id UUID REFERENCES sports_data.teams(id),
  team_provider_id BIGINT,            -- ID Highlightly de l'équipe
  team_name TEXT,                     -- Nom de l'équipe (fallback)
  team_logo TEXT,                     -- Logo de l'équipe (fallback)
  
  -- Joueur principal (celui qui fait l'action)
  player_id UUID REFERENCES sports_data.players(id),
  player_provider_id BIGINT,          -- ID Highlightly du joueur
  player_name TEXT NOT NULL,          -- Nom du joueur
  
  -- Joueur assistant (pour les buts)
  assisting_player_id UUID REFERENCES sports_data.players(id),
  assisting_player_provider_id BIGINT,
  assisting_player_name TEXT,
  
  -- Joueur remplacé (pour les substitutions)
  substituted_player_id UUID REFERENCES sports_data.players(id),
  substituted_player_provider_id BIGINT,
  substituted_player_name TEXT,
  
  -- Métadonnées
  provider TEXT DEFAULT 'highlightly',
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Index unique pour éviter les doublons
  UNIQUE(match_id, event_type, event_time, player_provider_id)
);

-- Trigger function pour enrichir les IDs
CREATE OR REPLACE FUNCTION sports_data.enrich_match_event_ids()
RETURNS TRIGGER AS $$
BEGIN
  -- Enrichir team_id via highlightly_id
  IF NEW.team_provider_id IS NOT NULL AND NEW.team_id IS NULL THEN
    SELECT id INTO NEW.team_id
    FROM sports_data.teams
    WHERE highlightly_id = NEW.team_provider_id
    LIMIT 1;
  END IF;
  
  -- Enrichir player_id via provider_id
  IF NEW.player_provider_id IS NOT NULL AND NEW.player_id IS NULL THEN
    SELECT id INTO NEW.player_id
    FROM sports_data.players
    WHERE provider_id = NEW.player_provider_id
    LIMIT 1;
  END IF;
  
  -- Enrichir assisting_player_id
  IF NEW.assisting_player_provider_id IS NOT NULL AND NEW.assisting_player_id IS NULL THEN
    SELECT id INTO NEW.assisting_player_id
    FROM sports_data.players
    WHERE provider_id = NEW.assisting_player_provider_id
    LIMIT 1;
  END IF;
  
  -- Enrichir substituted_player_id
  IF NEW.substituted_player_provider_id IS NOT NULL AND NEW.substituted_player_id IS NULL THEN
    SELECT id INTO NEW.substituted_player_id
    FROM sports_data.players
    WHERE provider_id = NEW.substituted_player_provider_id
    LIMIT 1;
  END IF;
  
  -- Extraire la minute de event_time (ex: "45+1" -> 45)
  IF NEW.event_time IS NOT NULL AND NEW.event_minute IS NULL THEN
    BEGIN
      NEW.event_minute := CAST(SPLIT_PART(NEW.event_time, '+', 1) AS INTEGER);
    EXCEPTION WHEN OTHERS THEN
      NEW.event_minute := NULL;
    END;
  END IF;
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trg_enrich_match_event_ids
  BEFORE INSERT OR UPDATE ON sports_data.match_events
  FOR EACH ROW EXECUTE FUNCTION sports_data.enrich_match_event_ids();

-- Enable RLS
ALTER TABLE sports_data.match_events ENABLE ROW LEVEL SECURITY;

-- Lecture publique
CREATE POLICY "Anyone can view match events"
  ON sports_data.match_events FOR SELECT
  USING (true);

-- Service role pour insertion/modification
CREATE POLICY "Service role can manage match events"
  ON sports_data.match_events FOR ALL
  USING (auth.role() = 'service_role');

-- Index pour performance
CREATE INDEX idx_match_events_match_id ON sports_data.match_events(match_id);
CREATE INDEX idx_match_events_event_type ON sports_data.match_events(event_type);
CREATE INDEX idx_match_events_player_id ON sports_data.match_events(player_id);
CREATE INDEX idx_match_events_minute ON sports_data.match_events(event_minute);