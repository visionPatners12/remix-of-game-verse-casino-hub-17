-- Enable RLS on existing tables that are missing it
ALTER TABLE public.country ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access on reference tables
-- These are typically reference data that should be readable by everyone

-- Country policies
CREATE POLICY "Anyone can read countries" 
ON public.country 
FOR SELECT 
USING (true);

-- Sports policies
CREATE POLICY "Anyone can read sports" 
ON public.sports 
FOR SELECT 
USING (true);

-- Leagues policies
CREATE POLICY "Anyone can read leagues" 
ON public.leagues 
FOR SELECT 
USING (true);

-- Teams policies
CREATE POLICY "Anyone can read teams" 
ON public.teams 
FOR SELECT 
USING (true);

-- Matches policies
CREATE POLICY "Anyone can read matches" 
ON public.matches 
FOR SELECT 
USING (true);

-- Fix function search paths
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    email, 
    username,
    first_name, 
    last_name,
    phone,
    country,
    date_of_birth,
    avatar_url,
    auth_method,
    privy_user_id,
    wallet_address
  ) VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'country',
    (NEW.raw_user_meta_data ->> 'date_of_birth')::DATE,
    NEW.raw_user_meta_data ->> 'avatar_url',
    COALESCE(NEW.raw_user_meta_data ->> 'auth_method', 'email'),
    NEW.raw_user_meta_data ->> 'privy_user_id',
    NEW.raw_user_meta_data ->> 'wallet_address'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;