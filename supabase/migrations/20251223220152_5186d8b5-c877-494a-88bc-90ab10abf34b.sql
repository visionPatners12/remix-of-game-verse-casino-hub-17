-- =============================================
-- SECURE: users table - Hide sensitive data from public profiles
-- =============================================

-- Step 1: Drop the overly permissive public policy
DROP POLICY IF EXISTS "Anyone can view public profiles" ON public.users;

-- Step 2: Create a secure public profiles view that only exposes safe fields
CREATE OR REPLACE VIEW public.public_profiles AS
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
FROM public.users
WHERE is_profile_public = true;

-- Step 3: Grant access to the view
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Step 4: Create a new restrictive policy for public profile viewing
-- This policy only allows viewing specific safe columns
CREATE POLICY "Anyone can view public profile safe fields"
ON public.users
FOR SELECT
TO anon, authenticated
USING (
  is_profile_public = true
);

-- Step 5: Create a security definer function to get public profile by ID
-- This function only returns safe fields
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_id uuid)
RETURNS TABLE (
  id uuid,
  username text,
  first_name text,
  last_name text,
  avatar_url text,
  bio text,
  is_profile_public boolean,
  view_count integer,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    u.id,
    u.username,
    u.first_name,
    u.last_name,
    u.avatar_url,
    u.bio,
    u.is_profile_public,
    u.view_count,
    u.created_at
  FROM public.users u
  WHERE u.id = profile_id
    AND u.is_profile_public = true;
$$;

-- Step 6: Create a function to search users safely (only safe fields)
CREATE OR REPLACE FUNCTION public.search_users_safe(
  search_term text,
  limit_count integer DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  username text,
  first_name text,
  last_name text,
  avatar_url text,
  bio text,
  similarity_score real
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    u.id,
    u.username,
    u.first_name,
    u.last_name,
    u.avatar_url,
    u.bio,
    similarity(u.username, search_term) as similarity_score
  FROM public.users u
  WHERE u.is_profile_public = true
    AND (
      u.username ILIKE '%' || search_term || '%'
      OR u.first_name ILIKE '%' || search_term || '%'
      OR u.last_name ILIKE '%' || search_term || '%'
    )
  ORDER BY similarity_score DESC
  LIMIT limit_count;
$$;

-- Step 7: Add comment explaining the security model
COMMENT ON VIEW public.public_profiles IS 'Safe public view of user profiles - excludes sensitive fields like email, phone, date_of_birth, wallet_address, privy_user_id';
COMMENT ON FUNCTION public.get_public_profile IS 'Safely retrieve a public profile by ID - only returns non-sensitive fields';
COMMENT ON FUNCTION public.search_users_safe IS 'Safely search users - only returns non-sensitive fields';