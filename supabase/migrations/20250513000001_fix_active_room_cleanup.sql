
-- Ajouter un vérificateur supplémentaire pour active_room_id à NULL
-- quand un joueur change son statut de connexion ou forfait

CREATE OR REPLACE FUNCTION public.clear_active_room_on_player_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Si le joueur se déconnecte ou abandonne
  IF (OLD.is_connected = TRUE AND NEW.is_connected = FALSE)
     OR (OLD.has_forfeited = FALSE AND NEW.has_forfeited = TRUE) 
  THEN
    -- Nettoyer l'active_room_id de l'utilisateur
    UPDATE public.users
    SET active_room_id = NULL
    WHERE id = NEW.user_id 
    AND active_room_id = NEW.session_id;
    
    -- Log l'action
    RAISE LOG 'Cleared active_room_id for user % from session %', 
      NEW.user_id, NEW.session_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS clear_active_room_on_player_change_trigger ON public.game_players;

-- Créer un trigger pour appeler la fonction sur les mises à jour des joueurs
CREATE TRIGGER clear_active_room_on_player_change_trigger
AFTER UPDATE OF is_connected, has_forfeited
ON public.game_players
FOR EACH ROW
EXECUTE FUNCTION public.clear_active_room_on_player_change();

-- Ajouter un commentaire
COMMENT ON FUNCTION public.clear_active_room_on_player_change IS 'Assure que active_room_id est mis à NULL quand un joueur se déconnecte ou abandonne';
