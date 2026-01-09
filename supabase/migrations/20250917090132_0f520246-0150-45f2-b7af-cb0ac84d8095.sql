-- Grant required privileges for live_streams to Supabase roles
-- Keep RLS as the enforcement layer

-- Ensure roles can use the public schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant table privileges (RLS will restrict row access)
GRANT SELECT ON TABLE public.live_streams TO anon; -- for public listing when visibility=true via RLS
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.live_streams TO authenticated;

-- Also grant on sequences in schema, if any are used later (safe even if none)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
