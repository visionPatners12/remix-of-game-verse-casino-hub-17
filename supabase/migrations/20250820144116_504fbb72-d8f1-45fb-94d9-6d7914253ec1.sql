-- Create sports table with all sports data from sportsMapping.ts
CREATE TABLE public.sports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  azuro_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon_name TEXT NOT NULL,
  category TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 999,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Sports are viewable by everyone" 
ON public.sports 
FOR SELECT 
USING (true);

-- Insert all sports data from sportsMapping.ts
INSERT INTO public.sports (azuro_id, name, slug, icon_name, category, display_order) VALUES
-- Mainstream Sports (ordered by betting volume)
('33', 'Football', 'football', 'FaFutbol', 'mainstream', 1),
('88', 'Basketball', 'basketball', 'FaBasketballBall', 'mainstream', 2),
('54', 'American Football', 'american-football', 'GiAmericanFootballBall', 'mainstream', 3),
('59', 'Tennis', 'tennis', 'FaTableTennis', 'mainstream', 4),
('48', 'Baseball', 'baseball', 'FaBaseballBall', 'mainstream', 5),
('65', 'Ice Hockey', 'ice-hockey', 'GiHockey', 'mainstream', 6),
('23', 'Volleyball', 'volleyball', 'FaVolleyballBall', 'mainstream', 7),
('74', 'Handball', 'handball', 'GiHandball', 'mainstream', 8),

-- Combat Sports
('61', 'MMA', 'mma', 'GiBoxingGlove', 'combat', 9),
('50', 'Boxing', 'boxing', 'FaFistRaised', 'combat', 10),

-- Rugby
('62', 'Rugby Union', 'rugby-union', 'GiRugbyBall', 'rugby', 11),
('60', 'Rugby League', 'rugby-league', 'GiRugbyBall', 'rugby', 12),

-- E-Sports
('1061', 'Counter-Strike 2', 'cs2', 'SiCounterstrike', 'esports', 13),
('1078', 'Dota 2', 'dota2', 'SiDota2', 'esports', 14),
('1002', 'League of Legends', 'lol', 'SiLeagueoflegends', 'esports', 15),
('1171', 'Valorant', 'valorant', 'SiValorant', 'esports', 16),
('1172', 'Call of Duty', 'cod', 'SiCallofduty', 'esports', 17),

-- Special Categories
('999', 'Politics', 'politics', 'FaVoteYea', 'special', 18),
('998', 'Other', 'other', 'FaEllipsisH', 'special', 19);

-- Add trigger for updated_at
CREATE TRIGGER update_sports_updated_at
    BEFORE UPDATE ON public.sports
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();