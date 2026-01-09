-- Create table for user sports preferences
CREATE TABLE public.user_sports_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  sport TEXT,
  team_sport TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one preference row per user
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_sports_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own sports preferences" 
ON public.user_sports_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sports preferences" 
ON public.user_sports_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sports preferences" 
ON public.user_sports_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sports preferences" 
ON public.user_sports_preferences 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_sports_preferences_updated_at
BEFORE UPDATE ON public.user_sports_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();