-- Enable RLS on leagues table and add policy for public read access
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;

-- Create policy for leagues table (public read access)
CREATE POLICY "Leagues are viewable by everyone" 
ON public.leagues 
FOR SELECT 
USING (true);