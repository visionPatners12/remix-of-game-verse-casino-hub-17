-- Grant SELECT on public_profiles to authenticated and anon roles
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;

-- Recreate the view to include all users (not just those with is_profile_public = true)
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_invoker = on) AS
SELECT 
  id,
  username,
  first_name,
  last_name,
  avatar_url,
  bio,
  is_profile_public,
  view_count,
  created_at
FROM public.users;