-- Create trigger to attach up_pref_assign_position function to user_preferences table
CREATE TRIGGER user_preferences_assign_position_trigger
  BEFORE INSERT OR UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.up_pref_assign_position();