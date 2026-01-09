
-- Créer la fonction trigger update_user_active_room() si elle n'existe pas déjà
CREATE OR REPLACE FUNCTION public.update_user_active_room()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF NEW.is_connected = TRUE THEN
    -- Set this room as active for the user
    UPDATE public.users
    SET active_room_id = NEW.session_id
    WHERE id = NEW.user_id;
  ELSIF OLD.is_connected = TRUE AND NEW.is_connected = FALSE THEN
    -- Clear active room when disconnecting
    UPDATE public.users
    SET active_room_id = NULL
    WHERE id = NEW.user_id AND active_room_id = NEW.session_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS update_user_active_room_trigger ON public.game_players;

-- Créer le trigger sur la table game_players
CREATE TRIGGER update_user_active_room_trigger
AFTER INSERT OR UPDATE OF is_connected
ON public.game_players
FOR EACH ROW
EXECUTE FUNCTION public.update_user_active_room();

-- S'assurer que le trigger fonctionne pour les insertions aussi
COMMENT ON TRIGGER update_user_active_room_trigger ON public.game_players IS 'Updates user.active_room_id when a player connects or disconnects from a room';
