
-- Add new metrics columns to casino_settings
ALTER TABLE public.casino_settings
ADD COLUMN IF NOT EXISTS total_user_wallets NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS realtime_wallet_value NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_amounts NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS actual_cash NUMERIC DEFAULT 0;

-- Create a function to recalculate the total user wallets
CREATE OR REPLACE FUNCTION public.update_casino_metrics()
RETURNS void AS $$
DECLARE
  v_total_wallets NUMERIC;
  v_locked_amounts NUMERIC;
BEGIN
  -- Calculate the total wallet balance of all users
  SELECT COALESCE(SUM(real_balance), 0) INTO v_total_wallets
  FROM public.wallets;
  
  -- Calculate locked amounts (stakes in active rooms)
  SELECT COALESCE(SUM(pot), 0) INTO v_locked_amounts
  FROM public.game_sessions
  WHERE status IN ('Waiting', 'Active');
  
  -- Update the casino metrics
  UPDATE public.casino_settings
  SET 
    total_user_wallets = v_total_wallets,
    locked_amounts = v_locked_amounts,
    realtime_wallet_value = actual_cash - v_locked_amounts,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a cron job to update casino metrics every hour
-- This requires the pg_cron extension to be enabled
-- SELECT cron.schedule('update-casino-metrics', '0 * * * *', 'SELECT public.update_casino_metrics()');
