-- Drop the old get_highlights function with TIMESTAMPTZ p_cursor signature
-- This resolves the PGRST203 error caused by function overload
DROP FUNCTION IF EXISTS public.get_highlights(UUID, INT, TIMESTAMPTZ, UUID, UUID);