-- Enable RLS on fixture and league_standings tables that don't have policies
ALTER TABLE public.fixture ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_standings ENABLE ROW LEVEL SECURITY;

-- Create policies for fixture table (public read access)
CREATE POLICY "Fixtures are viewable by everyone" 
ON public.fixture 
FOR SELECT 
USING (true);

-- Create policies for league_standings table (public read access)
CREATE POLICY "League standings are viewable by everyone" 
ON public.league_standings 
FOR SELECT 
USING (true);