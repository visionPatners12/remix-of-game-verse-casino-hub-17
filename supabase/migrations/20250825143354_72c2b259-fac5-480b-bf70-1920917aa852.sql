-- Add favorite leagues support and modify existing favorites to support arrays
ALTER TABLE public.users 
ADD COLUMN favorite_leagues TEXT[] DEFAULT '{}',
ALTER COLUMN favorite_team TYPE TEXT[] USING CASE 
  WHEN favorite_team IS NULL THEN '{}'::TEXT[]
  ELSE ARRAY[favorite_team]
END,
ALTER COLUMN favorite_sport TYPE TEXT[] USING CASE 
  WHEN favorite_sport IS NULL THEN '{}'::TEXT[]
  ELSE ARRAY[favorite_sport]
END;

-- Create top_leagues table for featured/popular leagues
CREATE TABLE public.top_leagues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id BIGINT NOT NULL,
  sport_id TEXT NOT NULL,
  priority_order INTEGER NOT NULL DEFAULT 999,
  is_featured BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create top_teams table for featured/popular teams
CREATE TABLE public.top_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id BIGINT NOT NULL,
  league_id BIGINT,
  sport_id TEXT NOT NULL,
  priority_order INTEGER NOT NULL DEFAULT 999,
  is_featured BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.top_leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.top_teams ENABLE ROW LEVEL SECURITY;

-- Create policies for top_leagues (read-only for everyone)
CREATE POLICY "Top leagues are viewable by everyone" 
ON public.top_leagues 
FOR SELECT 
USING (is_featured = true);

-- Create policies for top_teams (read-only for everyone)
CREATE POLICY "Top teams are viewable by everyone" 
ON public.top_teams 
FOR SELECT 
USING (is_featured = true);

-- Add some sample data for top leagues (popular European football leagues)
INSERT INTO public.top_leagues (league_id, sport_id, priority_order) VALUES
(39, 'football', 1),  -- Premier League
(140, 'football', 2), -- La Liga
(78, 'football', 3),  -- Bundesliga
(135, 'football', 4), -- Serie A
(61, 'football', 5),  -- Ligue 1
(2, 'football', 6),   -- Champions League
(3, 'football', 7);   -- UEFA Europa League