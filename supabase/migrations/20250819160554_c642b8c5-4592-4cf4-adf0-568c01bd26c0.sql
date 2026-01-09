-- Create leagues table
CREATE TABLE public.leagues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  sport TEXT NOT NULL,
  country_slug TEXT,
  image TEXT,
  external_id INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Leagues are viewable by everyone" 
ON public.leagues 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_leagues_updated_at
BEFORE UPDATE ON public.leagues
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial league data from existing mocks
INSERT INTO public.leagues (slug, name, sport, country_slug, external_id) VALUES
('premier-league', 'Premier League', 'football', 'england', 33973),
('la-liga', 'La Liga', 'football', 'spain', 33974),
('serie-a', 'Serie A', 'football', 'italy', 33975),
('bundesliga', 'Bundesliga', 'football', 'germany', 33976),
('ligue-1', 'Ligue 1', 'football', 'france', 33977),
('eredivisie', 'Eredivisie', 'football', 'netherlands', 33978),
('primeira-liga', 'Primeira Liga', 'football', 'portugal', 33979),
('scottish-premiership', 'Scottish Premiership', 'football', 'scotland', 33980),
('champions-league', 'UEFA Champions League', 'football', 'europe', 33981),
('europa-league', 'UEFA Europa League', 'football', 'europe', 33982);