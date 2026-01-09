-- Add view_count column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;

-- Create index for sorting by popularity
CREATE INDEX IF NOT EXISTS idx_users_view_count ON public.users(view_count DESC);

-- Create a function to increment view count safely
CREATE OR REPLACE FUNCTION public.increment_view_count(
  p_entity_type text,
  p_entity_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  CASE p_entity_type
    WHEN 'user' THEN
      UPDATE public.users 
      SET view_count = COALESCE(view_count, 0) + 1 
      WHERE id = p_entity_id::uuid;
    ELSE
      RAISE EXCEPTION 'Unknown entity type: %', p_entity_type;
  END CASE;
END;
$$;