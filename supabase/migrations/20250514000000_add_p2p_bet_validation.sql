
-- Create a function to validate that the match hasn't started yet
CREATE OR REPLACE FUNCTION public.validate_p2p_bet_match_time()
RETURNS trigger AS $$
DECLARE
  match_start_time TIMESTAMPTZ;
BEGIN
  -- Get the match start time
  SELECT starting_at INTO match_start_time
  FROM public.sport_matches
  WHERE id = NEW.match_id;
  
  -- If match has already started, reject the bet creation
  IF match_start_time <= NOW() THEN
    RAISE EXCEPTION 'Cannot create bet for a match that has already started (Match ID: %)', NEW.match_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to run the validation before inserting a new bet
CREATE TRIGGER validate_p2p_bet_match_time_trigger
BEFORE INSERT ON public.p2p_bets
FOR EACH ROW
EXECUTE FUNCTION public.validate_p2p_bet_match_time();

-- Add some additional security measures
-- 1. Add a check constraint to ensure the amount is positive
ALTER TABLE public.p2p_bets 
ADD CONSTRAINT check_positive_amount 
CHECK (amount_creator > 0);

-- 2. Create an index to improve query performance for match lookup
CREATE INDEX IF NOT EXISTS idx_p2p_bets_match_id ON public.p2p_bets(match_id);

-- 3. Ensure expires_at is in the future
ALTER TABLE public.p2p_bets
ADD CONSTRAINT check_future_expiration
CHECK (expires_at > NOW());

-- 4. Create a function to automatically set expiration time if not provided
CREATE OR REPLACE FUNCTION public.set_p2p_bet_expiration()
RETURNS trigger AS $$
BEGIN
  -- If expires_at is not set, default to 24 hours from now
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at := NOW() + INTERVAL '24 hours';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to set expiration time if not provided
CREATE TRIGGER set_p2p_bet_expiration_trigger
BEFORE INSERT ON public.p2p_bets
FOR EACH ROW
WHEN (NEW.expires_at IS NULL)
EXECUTE FUNCTION public.set_p2p_bet_expiration();
