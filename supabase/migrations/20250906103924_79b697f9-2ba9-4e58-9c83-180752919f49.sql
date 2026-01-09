-- Create user_pin table for PIN functionality
CREATE TABLE public.user_pin (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hashed_pin TEXT NOT NULL,
  pin_enabled BOOLEAN NOT NULL DEFAULT true,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one PIN per user
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_pin ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own PIN data" 
ON public.user_pin 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own PIN" 
ON public.user_pin 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own PIN" 
ON public.user_pin 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own PIN" 
ON public.user_pin 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_pin_updated_at
BEFORE UPDATE ON public.user_pin
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_user_pin_user_id ON public.user_pin(user_id);
CREATE INDEX idx_user_pin_locked_until ON public.user_pin(locked_until) WHERE locked_until IS NOT NULL;