-- Drop existing teams table and recreate with better structure
DROP TABLE IF EXISTS public.teams CASCADE;

-- Create new teams table with api_sport_id as primary key
CREATE TABLE public.teams (
  id integer PRIMARY KEY, -- API Sport ID
  name text NOT NULL,
  code text,
  country text,
  founded integer,
  national boolean DEFAULT false,
  logo_url text,
  venue_id integer,
  venue_name text,
  venue_address text,
  venue_city text,
  venue_capacity integer,
  venue_surface text,
  venue_image text,
  sport_id uuid REFERENCES public.sports(id),
  azuro_sport_id text, -- For Azuro sport reference
  slug text UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Teams are viewable by everyone"
  ON public.teams
  FOR SELECT
  USING (true);

-- Get the football sport ID from sports table for sport_id reference
-- Insert French Ligue 1 teams data
INSERT INTO public.teams (
  id, name, code, country, founded, national, logo_url,
  venue_id, venue_name, venue_address, venue_city, venue_capacity, venue_surface, venue_image,
  azuro_sport_id, slug
) VALUES
(79, 'Lille', 'LIL', 'France', 1944, false, 'https://media.api-sports.io/football/teams/79.png',
 19207, 'Decathlon Arena – Stade Pierre-Mauroy', '261, Boulevard de Tournai, l''Hôtel de Ville', 'Villeneuve d''Ascq', 50083, 'grass', 'https://media.api-sports.io/football/venues/19207.png',
 '1', 'lille'),
(80, 'Lyon', 'LYO', 'France', 1950, false, 'https://media.api-sports.io/football/teams/80.png',
 666, 'Groupama Stadium', 'Chemin du Montout', 'Décines-Charpieu', 61556, 'grass', 'https://media.api-sports.io/football/venues/666.png',
 '1', 'lyon'),
(81, 'Marseille', 'MAR', 'France', 1899, false, 'https://media.api-sports.io/football/teams/81.png',
 12678, 'Stade Orange Vélodrome', '3, boulevard Michelet', 'Marseille', 67394, 'grass', 'https://media.api-sports.io/football/venues/12678.png',
 '1', 'marseille'),
(82, 'Montpellier', 'MON', 'France', 1974, false, 'https://media.api-sports.io/football/teams/82.png',
 20107, 'Stade de la Mosson-Mondial 98', 'Avenue de Heidelberg', 'Montpellier', 32939, 'grass', 'https://media.api-sports.io/football/venues/20107.png',
 '1', 'montpellier'),
(83, 'Nantes', 'NAN', 'France', 1943, false, 'https://media.api-sports.io/football/teams/83.png',
 662, 'Stade de la Beaujoire - Louis Fonteneau', '5, boulevard de la Beaujoire', 'Nantes', 38285, 'grass', 'https://media.api-sports.io/football/venues/662.png',
 '1', 'nantes'),
(84, 'Nice', 'NIC', 'France', 1904, false, 'https://media.api-sports.io/football/teams/84.png',
 663, 'Allianz Riviera', 'Boulevard des Jardiniers', 'Nice', 35624, 'grass', 'https://media.api-sports.io/football/venues/663.png',
 '1', 'nice'),
(85, 'Paris Saint Germain', 'PAR', 'France', 1970, false, 'https://media.api-sports.io/football/teams/85.png',
 671, 'Parc des Princes', '24, rue du Commandant Guilbaud', 'Paris', 47929, 'grass', 'https://media.api-sports.io/football/venues/671.png',
 '1', 'paris-saint-germain'),
(91, 'Monaco', 'MON', 'France', 1919, false, 'https://media.api-sports.io/football/teams/91.png',
 20470, 'Stade Louis-II', '7, avenue des Castelans', 'Monaco', 18523, 'grass', 'https://media.api-sports.io/football/venues/20470.png',
 '1', 'monaco'),
(93, 'Reims', 'REI', 'France', 1909, false, 'https://media.api-sports.io/football/teams/93.png',
 674, 'Stade Auguste-Delaune II', '33, Chaussée Bocquaine', 'Reims', 21684, 'grass', 'https://media.api-sports.io/football/venues/674.png',
 '1', 'reims'),
(94, 'Rennes', 'REN', 'France', 1901, false, 'https://media.api-sports.io/football/teams/94.png',
 680, 'Roazhon Park', '111, route de Lorient', 'Rennes', 31127, 'grass', 'https://media.api-sports.io/football/venues/680.png',
 '1', 'rennes'),
(95, 'Strasbourg', 'STR', 'France', 1906, false, 'https://media.api-sports.io/football/teams/95.png',
 681, 'Stade de la Meinau', '12, rue de l''Extenwoerth', 'Strasbourg', 26109, 'grass', 'https://media.api-sports.io/football/venues/681.png',
 '1', 'strasbourg'),
(96, 'Toulouse', 'TOU', 'France', 1937, false, 'https://media.api-sports.io/football/teams/96.png',
 682, 'Stadium de Toulouse', '1, allée Gabriel Biènés', 'Toulouse', 33150, 'grass', 'https://media.api-sports.io/football/venues/682.png',
 '1', 'toulouse'),
(97, 'Lorient', 'LOR', 'France', 1926, false, 'https://media.api-sports.io/football/teams/97.png',
 21430, 'Stade du Moustoir - Yves Allainmat', '11, rue Jean Le Coutaller', 'Lorient', 18970, 'artificial turf', 'https://media.api-sports.io/football/venues/21430.png',
 '1', 'lorient'),
(99, 'Clermont Foot', 'CLE', 'France', 1990, false, 'https://media.api-sports.io/football/teams/99.png',
 21429, 'Stade Gabriel-Montpied', 'Rue Adrien-Mabut', 'Clermont-Ferrand', 13576, 'grass', 'https://media.api-sports.io/football/venues/21429.png',
 '1', 'clermont-foot'),
(106, 'Stade Brestois 29', 'BRE', 'France', 1950, false, 'https://media.api-sports.io/football/teams/106.png',
 641, 'Stade Francis-Le Blé', '26, rue de Quimper', 'Brest', 15931, 'grass', 'https://media.api-sports.io/football/venues/641.png',
 '1', 'stade-brestois-29'),
(111, 'Le Havre', 'HAV', 'France', 1872, false, 'https://media.api-sports.io/football/teams/111.png',
 652, 'Stade Océane', 'Boulevard de Léningrad', 'Le Havre', 25178, 'grass', 'https://media.api-sports.io/football/venues/652.png',
 '1', 'le-havre'),
(112, 'Metz', 'MET', 'France', 1932, false, 'https://media.api-sports.io/football/teams/112.png',
 658, 'Stade Saint-Symphorien', '3, allée Saint-Symphorien', 'Longeville-lès-Metz', 30000, 'grass', 'https://media.api-sports.io/football/venues/658.png',
 '1', 'metz'),
(116, 'Lens', 'LEN', 'France', 1906, false, 'https://media.api-sports.io/football/teams/116.png',
 654, 'Stade Bollaert-Delelis', '83, rue Maurice-Carton', 'Lens', 41233, 'grass', 'https://media.api-sports.io/football/venues/654.png',
 '1', 'lens'),
(1063, 'Saint Etienne', 'ETI', 'France', 1920, false, 'https://media.api-sports.io/football/teams/1063.png',
 676, 'Stade Geoffroy-Guichard', '14, rue Pierre et Paul Guichard', 'Saint-Ètienne', 41965, 'grass', 'https://media.api-sports.io/football/venues/676.png',
 '1', 'saint-etienne');

-- Update sport_id with actual football sport UUID from sports table
UPDATE public.teams 
SET sport_id = (SELECT id FROM public.sports WHERE azuro_id = '1' LIMIT 1)
WHERE azuro_sport_id = '1';

-- Create trigger for updated_at
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();