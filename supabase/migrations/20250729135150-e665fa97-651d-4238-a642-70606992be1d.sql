-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Teams are viewable by everyone" 
ON public.teams 
FOR SELECT 
USING (true);

-- Insert sample teams data
INSERT INTO public.teams (team_id, name, slug, logo_url) VALUES 
(2486, 'France', 'france', 'https://highlightly.net/soccer/images/teams/2486.png'),
(73119, 'Paris Saint Germain', 'paris-saint-germain', 'https://highlightly.net/soccer/images/teams/73119.png'),
(1631, 'Real Madrid', 'real-madrid', 'https://highlightly.net/soccer/images/teams/1631.png'),
(1627, 'Barcelona', 'barcelona', 'https://highlightly.net/soccer/images/teams/1627.png'),
(1632, 'Manchester United', 'manchester-united', 'https://highlightly.net/soccer/images/teams/1632.png');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_teams_updated_at
BEFORE UPDATE ON public.teams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();