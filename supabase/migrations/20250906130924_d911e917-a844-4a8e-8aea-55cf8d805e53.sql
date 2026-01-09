-- Clean up duplicate RLS policies on user_preferences table
-- Remove old duplicate policies that conflict with the main ones

-- Drop duplicate policies (keeping the main ones)
DROP POLICY IF EXISTS "up_delete_own" ON public.user_preferences;
DROP POLICY IF EXISTS "up_insert_own" ON public.user_preferences;
DROP POLICY IF EXISTS "up_select_own" ON public.user_preferences;
DROP POLICY IF EXISTS "up_update_own" ON public.user_preferences;

-- Ensure we have the correct primary policies
DROP POLICY IF EXISTS "Users can delete their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences; 
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;

-- Recreate clean, simplified policies
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences" ON public.user_preferences
FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for the position assignment function if it doesn't exist
DROP TRIGGER IF EXISTS trigger_up_pref_assign_position ON public.user_preferences;
CREATE TRIGGER trigger_up_pref_assign_position
  BEFORE INSERT ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.up_pref_assign_position();