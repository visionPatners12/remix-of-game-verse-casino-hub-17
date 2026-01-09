
-- Supprimer les déclencheurs et fonctions existants qui gèrent les changements automatiques
-- de statut de connexion des joueurs

-- Supprimer le trigger existant
DROP TRIGGER IF EXISTS clear_active_room_on_player_change_trigger ON public.game_players;

-- Supprimer la fonction existante
DROP FUNCTION IF EXISTS public.clear_active_room_on_player_change();

