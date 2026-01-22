-- Add missing columns for tournament frontend alignment
ALTER TABLE public.tournaments
ADD COLUMN IF NOT EXISTS start_when_full BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS prize_distribution_type TEXT DEFAULT 'standard';

-- Add RLS policy for users to create tournaments
CREATE POLICY "Users can create tournaments" 
ON public.tournaments 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- Add RLS policy for users to update their own tournaments
CREATE POLICY "Users can update their own tournaments" 
ON public.tournaments 
FOR UPDATE 
USING (auth.uid() = created_by);