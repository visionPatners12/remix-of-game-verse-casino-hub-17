-- Insert PSG data into teams table
INSERT INTO public.teams (team_id, name, slug, logo_url) VALUES 
(73119, 'Paris Saint Germain', 'paris-saint-germain', 'https://highlightly.net/soccer/images/teams/73119.png')
ON CONFLICT (team_id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  logo_url = EXCLUDED.logo_url;