-- Fix error-level security issues: Enable RLS on sports_data schema tables

-- Enable RLS on all sports_data tables that are missing it
ALTER TABLE sports_data.lineup ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports_data.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports_data.standings_group ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports_data.standings_stage ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports_data.stg_azuro_league ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports_data.stg_league_highlightly ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports_data.stg_match_highlighly ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports_data.stg_standing_highlightly ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports_data.stg_team_azuro ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports_data.stg_teams_highlightly ENABLE ROW LEVEL SECURITY;

-- Add policies for reference/data tables (public read access)

-- lineup policies
CREATE POLICY "Anyone can view lineup data"
  ON sports_data.lineup FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage lineup"
  ON sports_data.lineup FOR ALL
  TO service_role
  USING (true);

-- players policies
CREATE POLICY "Anyone can view players data"
  ON sports_data.players FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage players"
  ON sports_data.players FOR ALL
  TO service_role
  USING (true);

-- standings_group policies
CREATE POLICY "Anyone can view standings_group data"
  ON sports_data.standings_group FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage standings_group"
  ON sports_data.standings_group FOR ALL
  TO service_role
  USING (true);

-- standings_stage policies
CREATE POLICY "Anyone can view standings_stage data"
  ON sports_data.standings_stage FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage standings_stage"
  ON sports_data.standings_stage FOR ALL
  TO service_role
  USING (true);

-- Staging tables: Service role only (internal data processing)
CREATE POLICY "Service role can manage stg_azuro_league"
  ON sports_data.stg_azuro_league FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Service role can manage stg_league_highlightly"
  ON sports_data.stg_league_highlightly FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Service role can manage stg_match_highlighly"
  ON sports_data.stg_match_highlighly FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Service role can manage stg_standing_highlightly"
  ON sports_data.stg_standing_highlightly FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Service role can manage stg_team_azuro"
  ON sports_data.stg_team_azuro FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Service role can manage stg_teams_highlightly"
  ON sports_data.stg_teams_highlightly FOR ALL
  TO service_role
  USING (true);