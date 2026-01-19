-- =============================================
-- LUDO COMMISSION SYSTEM WITH 30-DAY HISTORY
-- =============================================

-- 1. Create ludo_commissions table
CREATE TABLE IF NOT EXISTS public.ludo_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Who receives the commission
  beneficiary_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Who played (the referral)
  player_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Game concerned
  game_id UUID NOT NULL REFERENCES public.ludo_games(id) ON DELETE CASCADE,
  
  -- Referral level (1 = N1 direct, 2 = N2 indirect)
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 2),
  
  -- Bet amount by the player
  bet_amount DECIMAL(18,6) NOT NULL DEFAULT 0,
  
  -- Commission rate applied
  commission_rate DECIMAL(5,4) NOT NULL,
  
  -- Commission amount
  commission_amount DECIMAL(18,6) NOT NULL DEFAULT 0,
  
  -- Status: pending, credited, paid
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'credited', 'paid')),
  
  -- Transaction hash if paid
  tx_hash TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  credited_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  
  -- Prevent duplicate commissions
  UNIQUE(game_id, beneficiary_id, level)
);

-- 2. Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_ludo_commissions_beneficiary 
  ON public.ludo_commissions(beneficiary_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ludo_commissions_status 
  ON public.ludo_commissions(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ludo_commissions_period 
  ON public.ludo_commissions(created_at, beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_ludo_commissions_game 
  ON public.ludo_commissions(game_id);

-- 3. Enable RLS
ALTER TABLE public.ludo_commissions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
CREATE POLICY "Users can view their own commissions"
  ON public.ludo_commissions FOR SELECT
  USING (auth.uid() = beneficiary_id);

CREATE POLICY "Service can manage all commissions"
  ON public.ludo_commissions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 5. Trigger function to calculate commissions when game finishes
CREATE OR REPLACE FUNCTION public.calculate_ludo_commissions()
RETURNS TRIGGER AS $$
DECLARE
  v_player RECORD;
  v_referrer_n1 UUID;
  v_referrer_n2 UUID;
  v_rate_n1 DECIMAL := 0.015;  -- 1.5% for N1
  v_rate_n2 DECIMAL := 0.005;  -- 0.5% for N2
  v_bet_amount DECIMAL;
BEGIN
  -- Only process when game status changes to 'finished'
  IF NEW.status = 'finished' AND (OLD.status IS NULL OR OLD.status != 'finished') THEN
    
    -- Get the bet amount for this game
    v_bet_amount := COALESCE(NEW.bet_amount, 0);
    
    -- Skip if no bet amount
    IF v_bet_amount <= 0 THEN
      RETURN NEW;
    END IF;
    
    -- For each player in the game
    FOR v_player IN 
      SELECT lgp.user_id
      FROM public.ludo_game_players lgp
      WHERE lgp.game_id = NEW.id 
        AND lgp.user_id IS NOT NULL
    LOOP
      -- Find N1 referrer (direct)
      SELECT referrer_id INTO v_referrer_n1
      FROM public.referrals
      WHERE referred_id = v_player.user_id
      LIMIT 1;
      
      -- If N1 referrer exists, create commission
      IF v_referrer_n1 IS NOT NULL THEN
        INSERT INTO public.ludo_commissions 
          (beneficiary_id, player_id, game_id, level, 
           bet_amount, commission_rate, commission_amount, status)
        VALUES 
          (v_referrer_n1, v_player.user_id, NEW.id, 1,
           v_bet_amount, v_rate_n1, v_bet_amount * v_rate_n1, 'pending')
        ON CONFLICT (game_id, beneficiary_id, level) DO NOTHING;
        
        -- Find N2 referrer (referrer of referrer)
        SELECT referrer_id INTO v_referrer_n2
        FROM public.referrals
        WHERE referred_id = v_referrer_n1
        LIMIT 1;
        
        -- If N2 referrer exists, create commission
        IF v_referrer_n2 IS NOT NULL THEN
          INSERT INTO public.ludo_commissions 
            (beneficiary_id, player_id, game_id, level, 
             bet_amount, commission_rate, commission_amount, status)
          VALUES 
            (v_referrer_n2, v_player.user_id, NEW.id, 2,
             v_bet_amount, v_rate_n2, v_bet_amount * v_rate_n2, 'pending')
          ON CONFLICT (game_id, beneficiary_id, level) DO NOTHING;
        END IF;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Create trigger on ludo_games
DROP TRIGGER IF EXISTS trg_ludo_game_commissions ON public.ludo_games;
CREATE TRIGGER trg_ludo_game_commissions
  AFTER UPDATE ON public.ludo_games
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_ludo_commissions();

-- 7. RPC function to get stats with period filtering
CREATE OR REPLACE FUNCTION public.get_ludo_referral_stats(
  p_user_id UUID,
  p_period_days INTEGER DEFAULT 30
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_period_start TIMESTAMPTZ;
  v_period_end TIMESTAMPTZ;
  v_result JSON;
BEGIN
  v_period_end := now();
  
  -- If period_days is 0 or null, get all time
  IF p_period_days IS NULL OR p_period_days <= 0 THEN
    v_period_start := '1970-01-01'::TIMESTAMPTZ;
  ELSE
    v_period_start := now() - (p_period_days || ' days')::INTERVAL;
  END IF;
  
  SELECT json_build_object(
    -- Referral counts (all time)
    'total_n1_referrals', COALESCE((
      SELECT COUNT(DISTINCT referred_id) 
      FROM referrals 
      WHERE referrer_id = p_user_id
    ), 0),
    'total_n2_referrals', COALESCE((
      SELECT COUNT(DISTINCT r2.referred_id)
      FROM referrals r1
      JOIN referrals r2 ON r2.referrer_id = r1.referred_id
      WHERE r1.referrer_id = p_user_id
    ), 0),
    
    -- Games count in period
    'total_games_n1', COALESCE((
      SELECT COUNT(DISTINCT game_id)
      FROM ludo_commissions
      WHERE beneficiary_id = p_user_id
        AND level = 1
        AND created_at >= v_period_start
        AND created_at <= v_period_end
    ), 0),
    'total_games_n2', COALESCE((
      SELECT COUNT(DISTINCT game_id)
      FROM ludo_commissions
      WHERE beneficiary_id = p_user_id
        AND level = 2
        AND created_at >= v_period_start
        AND created_at <= v_period_end
    ), 0),
    
    -- Earnings in period
    'total_earnings_n1', COALESCE((
      SELECT SUM(commission_amount)
      FROM ludo_commissions
      WHERE beneficiary_id = p_user_id
        AND level = 1
        AND created_at >= v_period_start
        AND created_at <= v_period_end
    ), 0),
    'total_earnings_n2', COALESCE((
      SELECT SUM(commission_amount)
      FROM ludo_commissions
      WHERE beneficiary_id = p_user_id
        AND level = 2
        AND created_at >= v_period_start
        AND created_at <= v_period_end
    ), 0),
    
    -- Total staked by referrals in period
    'total_staked_n1', COALESCE((
      SELECT SUM(bet_amount)
      FROM ludo_commissions
      WHERE beneficiary_id = p_user_id
        AND level = 1
        AND created_at >= v_period_start
        AND created_at <= v_period_end
    ), 0),
    'total_staked_n2', COALESCE((
      SELECT SUM(bet_amount)
      FROM ludo_commissions
      WHERE beneficiary_id = p_user_id
        AND level = 2
        AND created_at >= v_period_start
        AND created_at <= v_period_end
    ), 0),
    
    -- Earnings by status
    'pending_earnings', COALESCE((
      SELECT SUM(commission_amount)
      FROM ludo_commissions
      WHERE beneficiary_id = p_user_id
        AND status = 'pending'
        AND created_at >= v_period_start
        AND created_at <= v_period_end
    ), 0),
    'credited_earnings', COALESCE((
      SELECT SUM(commission_amount)
      FROM ludo_commissions
      WHERE beneficiary_id = p_user_id
        AND status = 'credited'
        AND created_at >= v_period_start
        AND created_at <= v_period_end
    ), 0),
    'paid_earnings', COALESCE((
      SELECT SUM(commission_amount)
      FROM ludo_commissions
      WHERE beneficiary_id = p_user_id
        AND status = 'paid'
        AND created_at >= v_period_start
        AND created_at <= v_period_end
    ), 0),
    
    -- Period info
    'period_start', v_period_start::DATE,
    'period_end', v_period_end::DATE,
    'period_days', p_period_days,
    
    -- User's referral code
    'referral_code', (SELECT referral_code FROM users WHERE id = p_user_id)
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_ludo_referral_stats(UUID, INTEGER) TO authenticated;