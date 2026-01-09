-- Add room management columns to ludo_games
ALTER TABLE public.ludo_games ADD COLUMN room_code text UNIQUE;
ALTER TABLE public.ludo_games ADD COLUMN started_at timestamptz;
ALTER TABLE public.ludo_games ADD COLUMN finished_at timestamptz;
ALTER TABLE public.ludo_games ADD COLUMN last_activity_at timestamptz DEFAULT now();

-- Add player state columns to ludo_game_players
ALTER TABLE public.ludo_game_players ADD COLUMN is_ready boolean DEFAULT false;
ALTER TABLE public.ludo_game_players ADD COLUMN is_connected boolean DEFAULT true;
ALTER TABLE public.ludo_game_players ADD COLUMN last_seen_at timestamptz DEFAULT now();
ALTER TABLE public.ludo_game_players ADD COLUMN turn_order integer;

-- Function to generate room code (6 characters: ABC123)
CREATE OR REPLACE FUNCTION public.generate_room_code()
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to check if all players are ready
CREATE OR REPLACE FUNCTION public.all_players_ready(game_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM ludo_game_players 
    WHERE ludo_game_players.game_id = all_players_ready.game_id 
    AND is_ready = false
  ) AND EXISTS (
    SELECT 1 FROM ludo_game_players 
    WHERE ludo_game_players.game_id = all_players_ready.game_id
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to auto-generate room code on game creation
CREATE OR REPLACE FUNCTION public.set_room_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.room_code IS NULL THEN
    LOOP
      NEW.room_code := generate_room_code();
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM ludo_games WHERE room_code = NEW.room_code
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-start game when all players ready
CREATE OR REPLACE FUNCTION public.check_auto_start_game()
RETURNS trigger AS $$
DECLARE
  game_record ludo_games%ROWTYPE;
BEGIN
  -- Get the game record
  SELECT * INTO game_record FROM ludo_games WHERE id = NEW.game_id;
  
  -- Only check if game is still in created status
  IF game_record.status = 'created' AND all_players_ready(NEW.game_id) THEN
    UPDATE ludo_games 
    SET status = 'active', 
        started_at = now(),
        last_activity_at = now()
    WHERE id = NEW.game_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to assign turn order when player joins
CREATE OR REPLACE FUNCTION public.assign_turn_order()
RETURNS trigger AS $$
BEGIN
  IF NEW.turn_order IS NULL THEN
    SELECT COALESCE(MAX(turn_order), 0) + 1 
    INTO NEW.turn_order
    FROM ludo_game_players 
    WHERE game_id = NEW.game_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate room code on insert
CREATE TRIGGER ludo_games_set_room_code
  BEFORE INSERT ON ludo_games
  FOR EACH ROW
  EXECUTE FUNCTION set_room_code();

-- Trigger to assign turn order when player joins
CREATE TRIGGER ludo_game_players_assign_turn_order
  BEFORE INSERT ON ludo_game_players
  FOR EACH ROW
  EXECUTE FUNCTION assign_turn_order();

-- Trigger to check auto-start when player becomes ready
CREATE TRIGGER ludo_game_players_check_auto_start
  AFTER UPDATE OF is_ready ON ludo_game_players
  FOR EACH ROW
  WHEN (NEW.is_ready = true AND OLD.is_ready = false)
  EXECUTE FUNCTION check_auto_start_game();

-- Trigger to check auto-start when new player joins and is ready
CREATE TRIGGER ludo_game_players_check_auto_start_insert
  AFTER INSERT ON ludo_game_players
  FOR EACH ROW
  WHEN (NEW.is_ready = true)
  EXECUTE FUNCTION check_auto_start_game();

-- Optimized indexes
CREATE INDEX idx_ludo_games_room_code ON ludo_games (room_code) WHERE room_code IS NOT NULL;
CREATE INDEX idx_ludo_games_status_active ON ludo_games (status) WHERE status IN ('created', 'active');
CREATE INDEX idx_ludo_games_created_by ON ludo_games (created_by);
CREATE INDEX idx_ludo_game_players_ready ON ludo_game_players (game_id, is_ready);
CREATE INDEX idx_ludo_game_players_turn_order ON ludo_game_players (game_id, turn_order);