-- Add view_count column to sports_data.teams
ALTER TABLE sports_data.teams ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_teams_view_count ON sports_data.teams(view_count DESC);

-- Add view_count column to sports_data.league
ALTER TABLE sports_data.league ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_league_view_count ON sports_data.league(view_count DESC);

-- Add view_count column to public.players
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_players_view_count ON public.players(view_count DESC);

-- Update the increment_view_count function to handle all entity types
CREATE OR REPLACE FUNCTION public.increment_view_count(
  p_entity_type text,
  p_entity_id text
) RETURNS void AS $$
BEGIN
  CASE p_entity_type
    WHEN 'user' THEN
      UPDATE public.users SET view_count = COALESCE(view_count, 0) + 1 WHERE id = p_entity_id::uuid;
    WHEN 'team' THEN
      UPDATE sports_data.teams SET view_count = COALESCE(view_count, 0) + 1 WHERE id = p_entity_id::uuid;
    WHEN 'league' THEN
      UPDATE sports_data.league SET view_count = COALESCE(view_count, 0) + 1 WHERE id = p_entity_id::uuid;
    WHEN 'player' THEN
      UPDATE public.players SET view_count = COALESCE(view_count, 0) + 1 WHERE id = p_entity_id::bigint;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;