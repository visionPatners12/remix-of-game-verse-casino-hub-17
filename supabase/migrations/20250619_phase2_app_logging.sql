
-- Migration: Phase 2.1 - App Logging Schema
-- Date: 2025-06-19
-- Description: Move logging tables to app_logging schema

-- =============================================
-- PHASE 2.1: APP_LOGGING SCHEMA MIGRATION
-- =============================================

-- Create logging tables in app_logging schema
CREATE TABLE app_logging.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id uuid,
  action text NOT NULL,
  target_id uuid,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE app_logging.admin_activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid,
  action_type admin_action_type NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb,
  ip_address text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE app_logging.game_activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_session_id uuid,
  game_type text NOT NULL,
  user_id uuid,
  action text NOT NULL,
  amount numeric,
  details jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE app_logging.user_session_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  event_type text NOT NULL,
  details jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE app_logging.financial_activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id uuid,
  user_id uuid,
  action text NOT NULL,
  amount numeric NOT NULL,
  balance_before numeric NOT NULL,
  balance_after numeric NOT NULL,
  source_type text NOT NULL,
  details jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE app_logging.system_performance_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  component text NOT NULL,
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  severity log_severity DEFAULT 'info'::log_severity,
  details jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE app_logging.user_geo_data (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  ip_address inet,
  country_code varchar(2),
  country_name varchar(100),
  region varchar(100),
  city varchar(100),
  calling_code varchar(10),
  currency_code varchar(3),
  currency_symbol varchar(5),
  time_zone_name varchar(50),
  time_zone_current_time timestamp with time zone,
  continent_name varchar(50),
  asn_name varchar(255),
  carrier_name varchar(100),
  is_threat boolean DEFAULT false,
  is_known_abuser boolean DEFAULT false,
  is_safe_user boolean DEFAULT true,
  geo_label text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Migrate data from public schema to app_logging
INSERT INTO app_logging.audit_logs 
SELECT * FROM public.audit_logs;

INSERT INTO app_logging.admin_activity_logs 
SELECT * FROM public.admin_activity_logs;

INSERT INTO app_logging.game_activity_logs 
SELECT * FROM public.game_activity_logs;

INSERT INTO app_logging.financial_activity_logs 
SELECT * FROM public.financial_activity_logs;

INSERT INTO app_logging.system_performance_logs 
SELECT * FROM public.system_performance_logs;

INSERT INTO app_logging.user_geo_data 
SELECT id, user_id, ip_address, country_code, country_name, region, city, 
       calling_code, currency_code, currency_symbol, time_zone_name, 
       time_zone_current_time, continent_name, asn_name, carrier_name, 
       is_threat, is_known_abuser, is_safe_user, geo_label, created_at, updated_at
FROM public.user_geo_data;

-- Create latest_user_geo view in app_logging
CREATE VIEW app_logging.latest_user_geo AS
SELECT DISTINCT ON (user_id) *
FROM app_logging.user_geo_data
WHERE user_id IS NOT NULL
ORDER BY user_id, created_at DESC;

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA app_logging TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA app_logging TO authenticated;

-- Add indexes for performance
CREATE INDEX idx_app_logging_audit_logs_actor_id ON app_logging.audit_logs(actor_id);
CREATE INDEX idx_app_logging_audit_logs_created_at ON app_logging.audit_logs(created_at);

CREATE INDEX idx_app_logging_admin_activity_logs_admin_id ON app_logging.admin_activity_logs(admin_id);
CREATE INDEX idx_app_logging_admin_activity_logs_created_at ON app_logging.admin_activity_logs(created_at);

CREATE INDEX idx_app_logging_game_activity_logs_user_id ON app_logging.game_activity_logs(user_id);
CREATE INDEX idx_app_logging_game_activity_logs_session_id ON app_logging.game_activity_logs(game_session_id);
CREATE INDEX idx_app_logging_game_activity_logs_created_at ON app_logging.game_activity_logs(created_at);

CREATE INDEX idx_app_logging_financial_logs_user_id ON app_logging.financial_activity_logs(user_id);
CREATE INDEX idx_app_logging_financial_logs_transaction_id ON app_logging.financial_activity_logs(transaction_id);
CREATE INDEX idx_app_logging_financial_logs_created_at ON app_logging.financial_activity_logs(created_at);

CREATE INDEX idx_app_logging_user_geo_user_id ON app_logging.user_geo_data(user_id);
CREATE INDEX idx_app_logging_user_geo_created_at ON app_logging.user_geo_data(created_at);

-- Add trigger for updated_at
CREATE TRIGGER update_user_geo_data_updated_at
    BEFORE UPDATE ON app_logging.user_geo_data
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_geo_data_updated_at();

-- Update functions to use new schema
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_admin_id uuid, 
  p_action_type admin_action_type, 
  p_entity_type text, 
  p_entity_id uuid, 
  p_details jsonb, 
  p_ip_address text DEFAULT NULL::text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO app_logging.admin_activity_logs (
    admin_id,
    action_type,
    entity_type,
    entity_id,
    details,
    ip_address
  )
  VALUES (
    p_admin_id,
    p_action_type,
    p_entity_type,
    p_entity_id,
    p_details,
    p_ip_address
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_system_performance(
  p_component text, 
  p_metric_name text, 
  p_metric_value numeric, 
  p_severity log_severity DEFAULT 'info'::log_severity, 
  p_details jsonb DEFAULT NULL::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO app_logging.system_performance_logs (
    component,
    metric_name,
    metric_value,
    severity,
    details
  )
  VALUES (
    p_component,
    p_metric_name,
    p_metric_value,
    p_severity,
    p_details
  );
END;
$function$;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Phase 2.1 Complete: Migrated logging tables to app_logging schema';
END $$;
