
-- Migration: Phase 1 - Create App Schemas with app_ prefix
-- Date: 2025-06-19
-- Description: Create functional domain schemas to organize database structure

-- =============================================
-- PHASE 1: CREATE APP SCHEMAS
-- =============================================

-- Drop schemas if they exist (for clean migration)
DROP SCHEMA IF EXISTS app_users CASCADE;
DROP SCHEMA IF EXISTS app_social CASCADE;
DROP SCHEMA IF EXISTS app_betting CASCADE;
DROP SCHEMA IF EXISTS app_games CASCADE;
DROP SCHEMA IF EXISTS app_payments CASCADE;
DROP SCHEMA IF EXISTS app_communication CASCADE;
DROP SCHEMA IF EXISTS app_store CASCADE;
DROP SCHEMA IF EXISTS app_tournaments CASCADE;  
DROP SCHEMA IF EXISTS app_news CASCADE;
DROP SCHEMA IF EXISTS app_logging CASCADE;

-- Create new functional domain schemas
CREATE SCHEMA app_users;
CREATE SCHEMA app_social;
CREATE SCHEMA app_betting;
CREATE SCHEMA app_games;
CREATE SCHEMA app_payments;
CREATE SCHEMA app_communication;
CREATE SCHEMA app_store;
CREATE SCHEMA app_tournaments;
CREATE SCHEMA app_news;
CREATE SCHEMA app_logging;

-- =============================================
-- SCHEMA DOCUMENTATION
-- =============================================

-- Users & Profiles Domain
COMMENT ON SCHEMA app_users IS 'User management, profiles, authentication, KYC, and user settings';

-- Social & Sport Domain  
COMMENT ON SCHEMA app_social IS 'User-generated sports content: forecasts, posts, opinions, follows, friendships';

-- Betting & Markets Domain
COMMENT ON SCHEMA app_betting IS 'P2P betting system, markets, odds, and betting transactions';

-- Games & Sessions Domain
COMMENT ON SCHEMA app_games IS 'Game sessions, types, players, and game-specific logic';

-- Payments & Wallet Domain
COMMENT ON SCHEMA app_payments IS 'Financial transactions, wallets, crypto payments, mobile money';

-- Communication Domain
COMMENT ON SCHEMA app_communication IS 'Chat messages, direct messages, notifications, and GIFs';

-- Store & Items Domain
COMMENT ON SCHEMA app_store IS 'Virtual store, items, avatars, chat words, and user purchases';

-- Tournaments Domain
COMMENT ON SCHEMA app_tournaments IS 'Tournament management, participants, matches, and prizes';

-- News & Blog Domain
COMMENT ON SCHEMA app_news IS 'Official app news articles, categories, tags, and comments';

-- Logging & Audit Domain
COMMENT ON SCHEMA app_logging IS 'System logs, audit trails, performance metrics, and geo data';

-- =============================================
-- SCHEMA METADATA VIEW
-- =============================================

-- Create a metadata view to track schemas and their purposes
CREATE OR REPLACE VIEW public.app_schemas_info AS
SELECT 
  schema_name,
  description,
  table_count,
  created_at
FROM (
  VALUES 
    ('app_users', 'User management, profiles, authentication, KYC, and user settings', 0, now()),
    ('app_social', 'User-generated sports content: forecasts, posts, opinions, follows, friendships', 0, now()),
    ('app_betting', 'P2P betting system, markets, odds, and betting transactions', 0, now()),
    ('app_games', 'Game sessions, types, players, and game-specific logic', 0, now()),
    ('app_payments', 'Financial transactions, wallets, crypto payments, mobile money', 0, now()),
    ('app_communication', 'Chat messages, direct messages, notifications, and GIFs', 0, now()),
    ('app_store', 'Virtual store, items, avatars, chat words, and user purchases', 0, now()),
    ('app_tournaments', 'Tournament management, participants, matches, and prizes', 0, now()),
    ('app_news', 'Official app news articles, categories, tags, and comments', 0, now()),
    ('app_logging', 'System logs, audit trails, performance metrics, and geo data', 0, now())
) AS t(schema_name, description, table_count, created_at);

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA app_users TO authenticated;
GRANT USAGE ON SCHEMA app_social TO authenticated;
GRANT USAGE ON SCHEMA app_betting TO authenticated;
GRANT USAGE ON SCHEMA app_games TO authenticated;
GRANT USAGE ON SCHEMA app_payments TO authenticated;
GRANT USAGE ON SCHEMA app_communication TO authenticated;
GRANT USAGE ON SCHEMA app_store TO authenticated;
GRANT USAGE ON SCHEMA app_tournaments TO authenticated;
GRANT USAGE ON SCHEMA app_news TO authenticated;
GRANT USAGE ON SCHEMA app_logging TO authenticated;

-- Enable RLS by default on all new schemas
ALTER DEFAULT PRIVILEGES IN SCHEMA app_users GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA app_social GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA app_betting GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA app_games GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA app_payments GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA app_communication GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA app_store GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA app_tournaments GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA app_news GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA app_logging GRANT SELECT ON TABLES TO authenticated;

-- Create function to get schema statistics
CREATE OR REPLACE FUNCTION public.get_app_schema_stats()
RETURNS TABLE(
  schema_name TEXT,
  description TEXT,
  table_count BIGINT,
  total_rows BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.schema_name::TEXT,
    s.description::TEXT,
    COALESCE(t.table_count, 0) as table_count,
    0::BIGINT as total_rows -- Will be updated in future phases
  FROM public.app_schemas_info s
  LEFT JOIN (
    SELECT 
      schemaname as schema_name,
      COUNT(*) as table_count
    FROM pg_tables 
    WHERE schemaname LIKE 'app_%'
    GROUP BY schemaname
  ) t ON s.schema_name = t.schema_name
  ORDER BY s.schema_name;
END;
$$;

-- Log the completion of Phase 1
DO $$
BEGIN
  RAISE NOTICE 'Phase 1 Complete: Created % app schemas with proper documentation and permissions', 
    (SELECT COUNT(*) FROM public.app_schemas_info);
END $$;
