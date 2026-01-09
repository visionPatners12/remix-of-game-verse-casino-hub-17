
-- Add phone_verified column to users table
ALTER TABLE public.users 
ADD COLUMN phone_verified BOOLEAN DEFAULT false;
