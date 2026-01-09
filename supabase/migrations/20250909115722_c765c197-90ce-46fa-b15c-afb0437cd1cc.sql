-- Set default value of is_profile_public to true for new users
ALTER TABLE public.users ALTER COLUMN is_profile_public SET DEFAULT true;

-- Update existing users to have public profiles by default
UPDATE public.users SET is_profile_public = true WHERE is_profile_public = false;