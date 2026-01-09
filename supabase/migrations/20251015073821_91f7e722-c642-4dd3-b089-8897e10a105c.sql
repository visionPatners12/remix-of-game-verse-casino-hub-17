-- Add visibility column to bets table
ALTER TABLE public.bets
ADD COLUMN visibility text NOT NULL DEFAULT 'public';

-- Add check constraint for visibility values
ALTER TABLE public.bets
ADD CONSTRAINT bets_visibility_check CHECK (visibility IN ('public', 'private'));