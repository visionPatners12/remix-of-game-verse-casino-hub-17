-- Step 1: Clean existing duplicates (keep only most recent active game per player)
WITH duplicates AS (
  SELECT lgp.id, lgp.user_id, lgp.joined_at,
    ROW_NUMBER() OVER (PARTITION BY lgp.user_id ORDER BY lgp.joined_at DESC) as rn
  FROM ludo_game_players lgp
  JOIN ludo_games lg ON lgp.game_id = lg.id
  WHERE lgp.has_exited = false
    AND lg.status IN ('created', 'active')
)
UPDATE ludo_game_players
SET has_exited = true
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);

-- Step 2: Create the validation function
CREATE OR REPLACE FUNCTION check_player_not_in_active_game()
RETURNS TRIGGER AS $$
DECLARE
  active_game_id UUID;
BEGIN
  -- Check if player is already in an active game
  SELECT lg.id INTO active_game_id
  FROM ludo_game_players lgp
  JOIN ludo_games lg ON lgp.game_id = lg.id
  WHERE lgp.user_id = NEW.user_id
    AND lgp.has_exited = false
    AND lg.status IN ('created', 'active')
  LIMIT 1;

  IF active_game_id IS NOT NULL THEN
    RAISE EXCEPTION 'ALREADY_IN_GAME: Player % is already in active game %', 
      NEW.user_id, active_game_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create the trigger
CREATE TRIGGER trg_check_player_not_in_active_game
BEFORE INSERT ON ludo_game_players
FOR EACH ROW
EXECUTE FUNCTION check_player_not_in_active_game();