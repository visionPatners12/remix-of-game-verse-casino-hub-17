-- Remove the dangerous exec_sql function that allows SQL injection
DROP FUNCTION IF EXISTS public.exec_sql(text);