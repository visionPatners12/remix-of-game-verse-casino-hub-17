
-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS update_user_active_room_trigger ON public.game_players;

-- Créer une nouvelle version améliorée de la fonction de trigger
CREATE OR REPLACE FUNCTION public.update_user_active_room()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Quand un joueur se connecte à une salle
  IF NEW.is_connected = TRUE THEN
    -- Vérifier que la session existe et n'est pas terminée
    IF EXISTS (SELECT 1 FROM public.game_sessions WHERE id = NEW.session_id AND status != 'Finished') THEN
      -- Définir cette salle comme active pour l'utilisateur
      UPDATE public.users
      SET active_room_id = NEW.session_id
      WHERE id = NEW.user_id;
    END IF;
  -- Quand un joueur se déconnecte d'une salle
  ELSIF OLD.is_connected = TRUE AND NEW.is_connected = FALSE THEN
    -- Effacer la salle active si c'est celle-ci
    UPDATE public.users
    SET active_room_id = NULL
    WHERE id = NEW.user_id AND active_room_id = NEW.session_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Créer le nouveau trigger sur la table game_players
CREATE TRIGGER update_user_active_room_trigger
AFTER INSERT OR UPDATE OF is_connected
ON public.game_players
FOR EACH ROW
EXECUTE FUNCTION public.update_user_active_room();

-- Ajouter un autre trigger pour mettre à jour l'état actif lorsqu'une partie se termine
CREATE OR REPLACE FUNCTION public.clear_active_room_on_game_end()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Si le statut passe à "Finished", effacer active_room_id pour tous les joueurs
  IF NEW.status = 'Finished' AND (OLD.status != 'Finished' OR OLD.status IS NULL) THEN
    UPDATE public.users u
    SET active_room_id = NULL
    FROM public.game_players gp
    WHERE gp.session_id = NEW.id
    AND gp.user_id = u.id
    AND u.active_room_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS clear_active_room_on_game_end_trigger ON public.game_sessions;

-- Créer le trigger sur la table game_sessions
CREATE TRIGGER clear_active_room_on_game_end_trigger
AFTER UPDATE OF status
ON public.game_sessions
FOR EACH ROW
EXECUTE FUNCTION public.clear_active_room_on_game_end();

-- Ajouter des commentaires
COMMENT ON FUNCTION public.update_user_active_room IS 'Met à jour active_room_id des utilisateurs lorsqu''un joueur se connecte ou se déconnecte d''une salle';
COMMENT ON FUNCTION public.clear_active_room_on_game_end IS 'Efface active_room_id des utilisateurs lorsqu''une partie se termine';
