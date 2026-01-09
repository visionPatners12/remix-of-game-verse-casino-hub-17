-- Supprimer l'ancienne colonne apiSportID
ALTER TABLE public.leagues DROP COLUMN IF EXISTS "apiSportID";

-- Créer la nouvelle colonne api_sport_id
ALTER TABLE public.leagues ADD COLUMN api_sport_id INTEGER;

-- Mettre à jour la Ligue 1 avec l'ID 61
UPDATE public.leagues 
SET api_sport_id = 61 
WHERE slug = 'ligue-1';

-- Ajouter quelques autres IDs courants pour les tests
UPDATE public.leagues 
SET api_sport_id = 39 
WHERE slug = 'premier-league';

UPDATE public.leagues 
SET api_sport_id = 140 
WHERE slug = 'la-liga';

UPDATE public.leagues 
SET api_sport_id = 135 
WHERE slug = 'serie-a';