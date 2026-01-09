-- Add name column to top_leagues table if it doesn't exist
ALTER TABLE public.top_leagues 
ADD COLUMN IF NOT EXISTS name TEXT;

-- Add unique constraint on league_id for conflict resolution
ALTER TABLE public.top_leagues 
ADD CONSTRAINT IF NOT EXISTS top_leagues_league_id_unique UNIQUE (league_id);

-- Insert Ligue 1 entry with the specified data
INSERT INTO public.top_leagues (league_id, name, sport_id, priority_order, is_featured)
VALUES (608, 'Ligue 1', '33', 1, true)
ON CONFLICT (league_id) 
DO UPDATE SET 
  name = EXCLUDED.name,
  sport_id = EXCLUDED.sport_id,
  is_featured = EXCLUDED.is_featured;