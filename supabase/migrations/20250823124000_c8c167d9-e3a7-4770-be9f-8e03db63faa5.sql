-- Drop the existing leagues table (this will remove all data)
DROP TABLE IF EXISTS public.leagues CASCADE;

-- Create the new leagues table with the specified structure
CREATE TABLE public.leagues (
  id bigserial PRIMARY KEY,
  sport_id uuid REFERENCES public.sports(id),
  display_name text NOT NULL,
  slug text NOT NULL UNIQUE,
  username text,
  logo_url text,
  competition_type text,
  country_code char(2),
  country_name text,
  apisports_league_id bigint UNIQUE,
  highlightly_league_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  stream_synced_at timestamptz
);

-- Enable RLS
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;

-- Recreate the RLS policy for public viewing
CREATE POLICY "Leagues are viewable by everyone" 
ON public.leagues 
FOR SELECT 
USING (true);

-- Add updated_at trigger
CREATE TRIGGER update_leagues_updated_at
  BEFORE UPDATE ON public.leagues
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_leagues_sport_id ON public.leagues(sport_id);
CREATE INDEX idx_leagues_slug ON public.leagues(slug);
CREATE INDEX idx_leagues_country_code ON public.leagues(country_code);
CREATE INDEX idx_leagues_apisports_league_id ON public.leagues(apisports_league_id);
CREATE INDEX idx_leagues_highlightly_league_id ON public.leagues(highlightly_league_id);