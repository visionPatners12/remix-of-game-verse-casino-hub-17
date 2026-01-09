-- Create enum for bet status
CREATE TYPE public.bet_status_enum AS ENUM (
  'pending',
  'won',
  'lost',
  'cancelled',
  'refunded'
);

-- Create enum for bet type
CREATE TYPE public.bet_type_enum AS ENUM (
  'single',
  'parlay',
  'system'
);

-- Create bets table
CREATE TABLE public.bets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
  
  -- Bet details
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  potential_win DECIMAL(10,2) NOT NULL CHECK (potential_win > 0),
  actual_win DECIMAL(10,2) DEFAULT 0,
  odds DECIMAL(10,4) NOT NULL CHECK (odds > 0),
  
  -- Bet configuration
  bet_type bet_type_enum NOT NULL DEFAULT 'single',
  status bet_status_enum NOT NULL DEFAULT 'pending',
  
  -- Selection details (JSON for flexibility with multiple selections in parlays)
  selections JSONB NOT NULL,
  
  -- Azuro integration
  condition_id TEXT,
  outcome_id TEXT,
  azuro_bet_id TEXT,
  
  -- Social sharing
  is_shared BOOLEAN DEFAULT false,
  analysis TEXT,
  hashtags TEXT[],
  
  -- Transaction details
  bet_code TEXT UNIQUE, -- Generated bet reference code
  currency TEXT DEFAULT 'USDT',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  settled_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own bets" 
ON public.bets 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bets" 
ON public.bets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bets" 
ON public.bets 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared bets" 
ON public.bets 
FOR SELECT 
USING (is_shared = true);

-- Create indexes for performance
CREATE INDEX idx_bets_user_id ON public.bets(user_id);
CREATE INDEX idx_bets_match_id ON public.bets(match_id);
CREATE INDEX idx_bets_status ON public.bets(status);
CREATE INDEX idx_bets_created_at ON public.bets(created_at DESC);
CREATE INDEX idx_bets_condition_outcome ON public.bets(condition_id, outcome_id);
CREATE INDEX idx_bets_shared ON public.bets(is_shared) WHERE is_shared = true;

-- Create trigger for updated_at
CREATE TRIGGER update_bets_updated_at
BEFORE UPDATE ON public.bets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate bet code
CREATE OR REPLACE FUNCTION public.generate_bet_code()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate bet code
CREATE OR REPLACE FUNCTION public.set_bet_code()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_bet_code_trigger
BEFORE INSERT ON public.bets
FOR EACH ROW
EXECUTE FUNCTION public.set_bet_code();