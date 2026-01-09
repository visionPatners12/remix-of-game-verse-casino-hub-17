-- Fix overly permissive RLS policies on players and fixture_status_ref tables
-- These tables should only allow service_role to modify data

-- =============================================
-- FIX: players table
-- =============================================

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Only service role can modify players" ON public.players;
DROP POLICY IF EXISTS "Service role can manage players" ON public.players;

-- Create proper service_role only policy for modifications
-- Note: service_role bypasses RLS by default, so we create a restrictive policy
-- that blocks all non-service_role users from modifying data
CREATE POLICY "Service role only can insert players"
ON public.players
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "Service role only can update players"
ON public.players
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "Service role only can delete players"
ON public.players
FOR DELETE
TO authenticated
USING (false);

-- =============================================
-- FIX: fixture_status_ref table
-- =============================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Only service role can modify fixture statuses" ON public.fixture_status_ref;

-- Create proper restrictive policies for modifications
CREATE POLICY "Service role only can insert fixture_status_ref"
ON public.fixture_status_ref
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "Service role only can update fixture_status_ref"
ON public.fixture_status_ref
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "Service role only can delete fixture_status_ref"
ON public.fixture_status_ref
FOR DELETE
TO authenticated
USING (false);