-- Fix RLS policies for tipster_profiles to handle wallet authentication
-- Drop existing policies and recreate them to handle both auth methods

DROP POLICY IF EXISTS "Users can manage their own tipster profile" ON tipster_profiles;
DROP POLICY IF EXISTS "Users can view their own tipster profile" ON tipster_profiles;

-- Create new policies that work with both Supabase auth and wallet auth
CREATE POLICY "Users can manage their own tipster profile" 
ON tipster_profiles 
FOR ALL
USING (
  -- Allow if user is authenticated via Supabase auth
  auth.uid() = user_id
  OR 
  -- Allow if user matches based on user_id from context (for wallet users)
  (auth.uid() IS NOT NULL AND user_id IN (
    SELECT id FROM users WHERE id = auth.uid()
  ))
);

CREATE POLICY "Users can view their own tipster profile" 
ON tipster_profiles 
FOR SELECT
USING (
  -- Allow if user is authenticated via Supabase auth
  auth.uid() = user_id
  OR 
  -- Allow if user matches based on user_id from context (for wallet users)
  (auth.uid() IS NOT NULL AND user_id IN (
    SELECT id FROM users WHERE id = auth.uid()
  ))
);