-- Create tipsters table
CREATE TABLE public.tipsters (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  monthly_price NUMERIC(10,2) NOT NULL,
  description   TEXT NOT NULL,
  specialties   TEXT[] DEFAULT '{}',
  experience    TEXT,

  -- Stats
  tips_won      INTEGER DEFAULT 0,
  tips_total    INTEGER DEFAULT 0,
  avg_odds      NUMERIC(5,2),          -- ex: 1.85
  yield_pct     NUMERIC(6,2),          -- ex: 12.34 (%)
  
  -- Constraint to ensure tips_won <= tips_total
  CONSTRAINT tips_won_le_total CHECK (tips_won <= tips_total),

  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tipsters ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Tipsters can view all active tipster profiles (for discovery)
CREATE POLICY "Anyone can view active tipster profiles" 
ON public.tipsters 
FOR SELECT 
USING (is_active = true);

-- Users can create their own tipster profile
CREATE POLICY "Users can create their own tipster profile" 
ON public.tipsters 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own tipster profile
CREATE POLICY "Users can update their own tipster profile" 
ON public.tipsters 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can view their own profile even if inactive
CREATE POLICY "Users can view their own tipster profile" 
ON public.tipsters 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_tipsters_updated_at
BEFORE UPDATE ON public.tipsters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();