-- 1. Ajouter la colonne match_id avec FK vers match.id
ALTER TABLE sports_data.highlights
ADD COLUMN match_id uuid REFERENCES sports_data.match(id);

-- 2. Créer un index pour les performances
CREATE INDEX idx_highlights_match_id ON sports_data.highlights(match_id);

-- 3. Peupler les match_id existants
UPDATE sports_data.highlights h
SET match_id = m.id
FROM sports_data.match m
WHERE h.match_highlightly_id = m.highlightly_id
  AND h.sport_id = m.sport_id
  AND h.match_id IS NULL;

-- 4. Créer la RPC pour matcher automatiquement les nouveaux highlights
CREATE OR REPLACE FUNCTION sports_data.link_highlights_to_matches()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = sports_data
AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE sports_data.highlights h
  SET match_id = m.id
  FROM sports_data.match m
  WHERE h.match_highlightly_id = m.highlightly_id
    AND h.sport_id = m.sport_id
    AND h.match_id IS NULL;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;