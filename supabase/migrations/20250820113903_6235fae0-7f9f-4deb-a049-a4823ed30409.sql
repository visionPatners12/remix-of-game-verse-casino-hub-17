-- Add additional columns to user_pin table for enhanced security
ALTER TABLE public.user_pin 
ADD COLUMN IF NOT EXISTS pin_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS failed_attempts integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS last_used_at timestamp with time zone DEFAULT NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_pin_user_id ON public.user_pin(user_id);
CREATE INDEX IF NOT EXISTS idx_user_pin_locked_until ON public.user_pin(locked_until) WHERE locked_until IS NOT NULL;

-- Update the trigger to reset failed attempts on successful update
CREATE OR REPLACE FUNCTION public.reset_pin_attempts()
RETURNS TRIGGER AS $$
BEGIN
  -- Reset failed attempts when PIN is successfully updated
  NEW.failed_attempts = 0;
  NEW.locked_until = NULL;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for PIN updates
DROP TRIGGER IF EXISTS reset_pin_attempts_trigger ON public.user_pin;
CREATE TRIGGER reset_pin_attempts_trigger
  BEFORE UPDATE ON public.user_pin
  FOR EACH ROW
  WHEN (OLD.hashed_pin IS DISTINCT FROM NEW.hashed_pin)
  EXECUTE FUNCTION public.reset_pin_attempts();