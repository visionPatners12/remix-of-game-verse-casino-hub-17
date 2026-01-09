-- Expose the social_post schema in the PostgREST API
ALTER ROLE authenticator SET pgrst.db_schemas TO 'public, social_post, storage';

-- Grant usage on the social_post schema to authenticated and anon roles
GRANT USAGE ON SCHEMA social_post TO authenticated, anon;

-- Grant privileges on existing tables in social_post schema
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA social_post TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA social_post TO anon;

-- Set default privileges for future tables in social_post schema
ALTER DEFAULT PRIVILEGES IN SCHEMA social_post 
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA social_post 
GRANT SELECT ON TABLES TO anon;

-- Grant usage on sequences (for auto-increment IDs if any)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA social_post TO authenticated, anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA social_post 
GRANT USAGE ON SEQUENCES TO authenticated, anon;