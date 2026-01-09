-- Update Ligue 1 with correct external_id and logo
UPDATE public.leagues 
SET 
  external_id = 52695,
  image = 'https://highlightly.net/soccer/images/leagues/52695.png',
  sport = 'soccer',
  updated_at = now()
WHERE slug = 'ligue-1';