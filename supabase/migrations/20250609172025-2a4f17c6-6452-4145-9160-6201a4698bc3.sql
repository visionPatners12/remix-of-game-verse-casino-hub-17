
-- Drop the duplicate function with 2 parameters to resolve the ambiguity
DROP FUNCTION IF EXISTS public.subscribe_to_premium_forecasts(p_creator_id uuid, p_payment_method text);
