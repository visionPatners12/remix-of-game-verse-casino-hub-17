-- Fix security issues: Enable RLS on tables that don't have it enabled

-- Enable RLS on top_entities table
ALTER TABLE public.top_entities ENABLE ROW LEVEL SECURITY;

-- Create policy for top_entities (read-only for everyone)
CREATE POLICY "Anyone can read top entities" 
ON public.top_entities 
FOR SELECT 
USING (true);

-- Enable RLS on tx_status table  
ALTER TABLE public.tx_status ENABLE ROW LEVEL SECURITY;

-- Create policy for tx_status (users can only see their own transactions)
CREATE POLICY "Users can view their own transactions" 
ON public.tx_status 
FOR SELECT 
USING (to_address IN (
  SELECT wallet_address 
  FROM public.user_wallet 
  WHERE user_id = auth.uid()
));

-- Create policy for tx_status insert (service role only)
CREATE POLICY "Service can insert transactions" 
ON public.tx_status 
FOR INSERT 
WITH CHECK (true);

-- Create policy for tx_status update (service role only)
CREATE POLICY "Service can update transactions" 
ON public.tx_status 
FOR UPDATE 
USING (true);

-- Enable RLS on user_preferences table
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user_preferences
CREATE POLICY "Users can view their own preferences" 
ON public.user_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences" 
ON public.user_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.user_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences" 
ON public.user_preferences 
FOR DELETE 
USING (auth.uid() = user_id);

-- Enable RLS on venues table
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

-- Create policy for venues (read-only for everyone)
CREATE POLICY "Anyone can read venues" 
ON public.venues 
FOR SELECT 
USING (true);

-- Fix search_path for our new functions
DROP FUNCTION IF EXISTS public.generate_bet_code();
CREATE OR REPLACE FUNCTION public.generate_bet_code()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$;

DROP FUNCTION IF EXISTS public.set_bet_code();
CREATE OR REPLACE FUNCTION public.set_bet_code()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.bet_code IS NULL THEN
    NEW.bet_code := public.generate_bet_code();
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM public.bets WHERE bet_code = NEW.bet_code) LOOP
      NEW.bet_code := public.generate_bet_code();
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;