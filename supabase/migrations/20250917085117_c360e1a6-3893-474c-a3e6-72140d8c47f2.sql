-- Create stream_status enum
CREATE TYPE stream_status_enum AS ENUM ('created', 'live', 'ended');

-- Create live_streams table
CREATE TABLE public.live_streams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  match_id UUID REFERENCES public.matches(id),
  title TEXT NOT NULL,
  description TEXT,
  hashtags TEXT[] DEFAULT '{}',
  visibility BOOLEAN NOT NULL DEFAULT true,
  viewers_count INTEGER NOT NULL DEFAULT 0,
  status stream_status_enum NOT NULL DEFAULT 'created',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can create their own streams" 
ON public.live_streams 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own streams" 
ON public.live_streams 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public streams" 
ON public.live_streams 
FOR SELECT 
USING (visibility = true);

CREATE POLICY "Users can update their own streams" 
ON public.live_streams 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own streams" 
ON public.live_streams 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_live_streams_updated_at
BEFORE UPDATE ON public.live_streams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();