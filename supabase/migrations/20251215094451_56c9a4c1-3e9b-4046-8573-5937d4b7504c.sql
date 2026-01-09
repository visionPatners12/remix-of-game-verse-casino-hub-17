-- Add is_public column to ludo_games table
ALTER TABLE public.ludo_games 
ADD COLUMN is_public BOOLEAN DEFAULT true;