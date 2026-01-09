-- Fonction pour générer le username des équipes basé sur slug_countryCode
CREATE OR REPLACE FUNCTION public.generate_team_username(team_slug text, country_code text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $function$
  SELECT CASE 
    WHEN team_slug IS NOT NULL AND country_code IS NOT NULL THEN
      lower(team_slug || '_' || country_code)
    WHEN team_slug IS NOT NULL THEN
      lower(team_slug)
    ELSE
      NULL
  END;
$function$;

-- Fonction pour mettre à jour le username d'une équipe par ID
CREATE OR REPLACE FUNCTION public.update_team_username(team_id_param uuid)
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
  team_username text;
BEGIN
  SELECT public.generate_team_username(t.slug, c.code)
  INTO team_username
  FROM public.teams t
  LEFT JOIN public.country c ON c.id = t.country_id
  WHERE t.id = team_id_param;

  RETURN team_username;
END;
$function$;

-- Fonction pour générer les usernames de toutes les équipes
CREATE OR REPLACE FUNCTION public.generate_all_team_usernames()
RETURNS TABLE(team_id uuid, team_name text, username text)
LANGUAGE sql
STABLE
AS $function$
  SELECT 
    t.id as team_id,
    t.name as team_name,
    public.generate_team_username(t.slug, c.code) as username
  FROM public.teams t
  LEFT JOIN public.country c ON c.id = t.country_id
  ORDER BY t.name;
$function$;