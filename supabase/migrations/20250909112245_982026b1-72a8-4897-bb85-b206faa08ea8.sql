-- Ajouter la colonne username à la table teams
ALTER TABLE public.teams 
ADD COLUMN username text UNIQUE;

-- Ajouter la colonne username à la table leagues
ALTER TABLE public.leagues 
ADD COLUMN username text UNIQUE;

-- Fonction pour générer le username des leagues basé sur slug_countryCode
CREATE OR REPLACE FUNCTION public.generate_league_username(league_slug text, country_code text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $function$
  SELECT CASE 
    WHEN league_slug IS NOT NULL AND country_code IS NOT NULL THEN
      lower(league_slug || '_' || country_code)
    WHEN league_slug IS NOT NULL THEN
      lower(league_slug)
    ELSE
      NULL
  END;
$function$;

-- Trigger pour auto-générer le username des teams
CREATE OR REPLACE FUNCTION public.teams_generate_username()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  country_code_val text;
BEGIN
  -- Récupérer le code pays
  SELECT c.code INTO country_code_val
  FROM public.country c
  WHERE c.id = NEW.country_id;
  
  -- Générer le username
  NEW.username := public.generate_team_username(NEW.slug, country_code_val);
  
  RETURN NEW;
END;
$function$;

-- Trigger pour auto-générer le username des leagues
CREATE OR REPLACE FUNCTION public.leagues_generate_username()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  country_code_val text;
BEGIN
  -- Récupérer le code pays
  SELECT c.code INTO country_code_val
  FROM public.country c
  WHERE c.id = NEW.country_id;
  
  -- Générer le username
  NEW.username := public.generate_league_username(NEW.slug, country_code_val);
  
  RETURN NEW;
END;
$function$;

-- Créer les triggers
CREATE TRIGGER teams_username_trigger
  BEFORE INSERT OR UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.teams_generate_username();

CREATE TRIGGER leagues_username_trigger
  BEFORE INSERT OR UPDATE ON public.leagues
  FOR EACH ROW
  EXECUTE FUNCTION public.leagues_generate_username();

-- Mettre à jour les données existantes pour teams
UPDATE public.teams 
SET username = public.generate_team_username(
  teams.slug, 
  (SELECT country.code FROM public.country WHERE country.id = teams.country_id)
);

-- Mettre à jour les données existantes pour leagues
UPDATE public.leagues 
SET username = public.generate_league_username(
  leagues.slug, 
  (SELECT country.code FROM public.country WHERE country.id = leagues.country_id)
);