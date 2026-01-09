-- Expose sports_data schema to PostgREST by adding it to pgrst.db_schemas
ALTER ROLE authenticator SET pgrst.db_schemas = 'public, social_post, storage, sports_data';

-- Reload PostgREST configuration and schema cache
NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';