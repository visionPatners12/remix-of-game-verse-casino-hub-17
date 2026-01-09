-- Enable RLS on teams table and add policy for public read access
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Create policy for teams table (public read access)
CREATE POLICY "Teams are viewable by everyone" 
ON public.teams 
FOR SELECT 
USING (true);