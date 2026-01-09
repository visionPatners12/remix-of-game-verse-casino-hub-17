
-- Create or replace the function to handle player forfeits
CREATE OR REPLACE FUNCTION public.handle_player_forfeit()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Check if all but one player have forfeited or disconnected
  -- AND that the game session is in an Active state
  IF (
    SELECT COUNT(*) = 1 
    FROM game_players gp
    JOIN game_sessions gs ON gs.id = gp.session_id  
    WHERE gp.session_id = NEW.session_id 
    AND gp.has_forfeited = false
    AND gp.is_connected = true
    AND gs.status = 'Active'  -- Only process if the game is active
  ) THEN
    DECLARE
      winner_id UUID;
      winner_name TEXT;
      winner_avatar TEXT;
      session_pot NUMERIC;
      winning_amount NUMERIC;
      wallet_id UUID;
      current_balance NUMERIC;
    BEGIN
      -- Get the winner (last remaining player)
      SELECT 
        gp.user_id, 
        gp.display_name,
        u.avatar_url
      INTO 
        winner_id,
        winner_name, 
        winner_avatar
      FROM game_players gp
      JOIN users u ON u.id = gp.user_id
      WHERE gp.session_id = NEW.session_id 
        AND gp.has_forfeited = false
        AND gp.is_connected = true
      LIMIT 1;
      
      -- Get the pot amount
      SELECT
        pot 
      INTO 
        session_pot
      FROM game_sessions
      WHERE id = NEW.session_id;
      
      -- If there's prize money, add it to the winner's wallet
      IF session_pot > 0 THEN
        -- Get winner's wallet
        SELECT 
          id, 
          real_balance 
        INTO 
          wallet_id, 
          current_balance
        FROM wallets
        WHERE user_id = winner_id;
        
        -- Update wallet balance
        UPDATE wallets
        SET real_balance = current_balance + session_pot
        WHERE id = wallet_id;
        
        -- Record the transaction
        INSERT INTO transactions (
          wallet_id,
          amount,
          type,
          source_balance,
          status,
          description
        ) VALUES (
          wallet_id,
          session_pot,
          'Winnings',
          'real',
          'Success',
          'Gain par forfait - Salle: ' || NEW.session_id
        );
      END IF;
      
      -- Create standings array
      DECLARE 
        standings JSONB := jsonb_build_array(
          jsonb_build_object(
            'user_id', winner_id,
            'display_name', winner_name,
            'position', 1,
            'prize', session_pot,
            'avatar_url', winner_avatar
          )
        );
      BEGIN
        -- Update session to Finished with winner information
        UPDATE game_sessions 
        SET 
          status = 'Finished',
          end_time = NOW(),
          standings = standings
        WHERE id = NEW.session_id
        AND status <> 'Finished'; -- Only if not already finished
      END;
    END;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Make sure we have a trigger attached to the game_players table
DROP TRIGGER IF EXISTS on_player_forfeit ON game_players;

CREATE TRIGGER on_player_forfeit
  AFTER UPDATE OF has_forfeited
  ON game_players
  FOR EACH ROW
  WHEN (OLD.has_forfeited = false AND NEW.has_forfeited = true)
  EXECUTE FUNCTION handle_player_forfeit();

-- Add a comment to describe what this trigger does
COMMENT ON FUNCTION handle_player_forfeit IS 'Automatically handles winner determination when a player forfeits, leaving only one player in the active game';
