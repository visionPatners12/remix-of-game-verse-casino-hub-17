
-- Add bio and favorite_team columns to users table
ALTER TABLE public.users 
ADD COLUMN bio TEXT,
ADD COLUMN favorite_team TEXT;
