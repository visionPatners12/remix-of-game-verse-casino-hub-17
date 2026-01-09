-- Drop all existing INSERT policies on bets table to avoid duplicates
DROP POLICY IF EXISTS "Users can create their own bets" ON public.bets;

-- Create a single, clean INSERT policy for bets
CREATE POLICY "Users can create their own bets"
ON public.bets
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);