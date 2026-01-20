-- Drop the overly permissive policy that exposes all columns
DROP POLICY IF EXISTS "Anyone can view public profile safe fields" ON public.users;

-- Grant SELECT on the safe view to anonymous and authenticated users
GRANT SELECT ON public.public_profiles TO anon;
GRANT SELECT ON public.public_profiles TO authenticated;

-- Add a comment for documentation
COMMENT ON VIEW public.public_profiles IS 'Safe public view of user profiles - only exposes non-sensitive fields';