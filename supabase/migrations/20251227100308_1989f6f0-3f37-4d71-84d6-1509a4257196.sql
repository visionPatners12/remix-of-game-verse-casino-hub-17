-- =============================================
-- MLM System Tables and Functions
-- =============================================

-- 1. Table: referral_codes (unique codes per user)
CREATE TABLE IF NOT EXISTS social_post.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  uses_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON social_post.referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON social_post.referral_codes(user_id);

-- 2. Table: referrals (multi-level referral links)
CREATE TABLE IF NOT EXISTS social_post.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 3),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(referrer_id, referred_id, level)
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON social_post.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON social_post.referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_level ON social_post.referrals(level);

-- 3. Table: mlm_monthly_stats (monthly aggregated stats)
CREATE TABLE IF NOT EXISTS social_post.mlm_monthly_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 3),
  referrals_count INTEGER DEFAULT 0,
  total_staked DECIMAL(18,2) DEFAULT 0,
  total_won DECIMAL(18,2) DEFAULT 0,
  net_margin DECIMAL(18,2) DEFAULT 0,
  commission_rate DECIMAL(5,4) NOT NULL,
  commission_earned DECIMAL(18,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'credited', 'paid')),
  credited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, month, level)
);

CREATE INDEX IF NOT EXISTS idx_mlm_monthly_stats_user ON social_post.mlm_monthly_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_mlm_monthly_stats_month ON social_post.mlm_monthly_stats(month);

-- 4. Table: mlm_settings (commission rates configuration)
CREATE TABLE IF NOT EXISTS social_post.mlm_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level INTEGER UNIQUE NOT NULL CHECK (level BETWEEN 1 AND 3),
  commission_rate DECIMAL(5,4) NOT NULL,
  min_margin_amount DECIMAL(18,2) DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default rates (5%, 3%, 1%)
INSERT INTO social_post.mlm_settings (level, commission_rate) VALUES
  (1, 0.05),
  (2, 0.03),
  (3, 0.01)
ON CONFLICT (level) DO NOTHING;

-- =============================================
-- RLS Policies
-- =============================================

ALTER TABLE social_post.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post.mlm_monthly_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post.mlm_settings ENABLE ROW LEVEL SECURITY;

-- Referral codes: users can view their own
CREATE POLICY "Users can view their own referral code" 
  ON social_post.referral_codes FOR SELECT USING (auth.uid() = user_id);

-- Referrals: visible by referrer or referred
CREATE POLICY "Users can view their referrals" 
  ON social_post.referrals FOR SELECT 
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- MLM Stats: users can view their own stats
CREATE POLICY "Users can view their MLM stats" 
  ON social_post.mlm_monthly_stats FOR SELECT USING (auth.uid() = user_id);

-- Settings: public read
CREATE POLICY "Anyone can read MLM settings" 
  ON social_post.mlm_settings FOR SELECT USING (true);

-- =============================================
-- RPC Functions
-- =============================================

-- 1. Generate referral code
CREATE OR REPLACE FUNCTION social_post.generate_referral_code(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
BEGIN
  -- Check if user already has a code
  SELECT code INTO v_code FROM social_post.referral_codes WHERE user_id = p_user_id;
  IF v_code IS NOT NULL THEN RETURN v_code; END IF;
  
  -- Generate unique code PRYZEN_XXXXXX
  LOOP
    v_code := 'PRYZEN_' || upper(substring(md5(random()::text) from 1 for 6));
    SELECT EXISTS(SELECT 1 FROM social_post.referral_codes WHERE code = v_code) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;
  
  INSERT INTO social_post.referral_codes (user_id, code) VALUES (p_user_id, v_code);
  RETURN v_code;
END;
$$;

-- 2. Validate referral code
CREATE OR REPLACE FUNCTION social_post.validate_referral_code(p_code TEXT)
RETURNS TABLE(is_valid BOOLEAN, referrer_id UUID, referrer_username TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    true AS is_valid,
    rc.user_id AS referrer_id,
    u.username AS referrer_username
  FROM social_post.referral_codes rc
  JOIN public.users u ON u.id = rc.user_id
  WHERE rc.code = upper(p_code) AND rc.is_active = true;
END;
$$;

-- 3. Process referral signup (create links up to 3 levels)
CREATE OR REPLACE FUNCTION social_post.process_referral_signup(
  p_referred_id UUID,
  p_code TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer_n1 UUID;
  v_referrer_n2 UUID;
  v_referrer_n3 UUID;
BEGIN
  -- Find direct referrer (N1)
  SELECT user_id INTO v_referrer_n1 
  FROM social_post.referral_codes 
  WHERE code = upper(p_code) AND is_active = true;
  
  IF v_referrer_n1 IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_code');
  END IF;
  
  -- Prevent self-referral
  IF v_referrer_n1 = p_referred_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'self_referral');
  END IF;
  
  -- Check if already referred
  IF EXISTS(SELECT 1 FROM social_post.referrals WHERE referred_id = p_referred_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_referred');
  END IF;
  
  -- Create N1 link
  INSERT INTO social_post.referrals (referrer_id, referred_id, level) 
  VALUES (v_referrer_n1, p_referred_id, 1);
  
  -- Increment code usage counter
  UPDATE social_post.referral_codes SET uses_count = uses_count + 1 WHERE code = upper(p_code);
  
  -- Find N2 (N1's referrer)
  SELECT referrer_id INTO v_referrer_n2 
  FROM social_post.referrals 
  WHERE referred_id = v_referrer_n1 AND level = 1;
  
  IF v_referrer_n2 IS NOT NULL THEN
    INSERT INTO social_post.referrals (referrer_id, referred_id, level) 
    VALUES (v_referrer_n2, p_referred_id, 2);
    
    -- Find N3
    SELECT referrer_id INTO v_referrer_n3 
    FROM social_post.referrals 
    WHERE referred_id = v_referrer_n2 AND level = 1;
    
    IF v_referrer_n3 IS NOT NULL THEN
      INSERT INTO social_post.referrals (referrer_id, referred_id, level) 
      VALUES (v_referrer_n3, p_referred_id, 3);
    END IF;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'n1', v_referrer_n1,
    'n2', v_referrer_n2,
    'n3', v_referrer_n3
  );
END;
$$;

-- 4. Get MLM network (referral tree with stats)
CREATE OR REPLACE FUNCTION social_post.get_mlm_network(p_user_id UUID)
RETURNS TABLE(
  level INTEGER,
  referrals_count BIGINT,
  total_staked DECIMAL,
  total_won DECIMAL,
  net_margin DECIMAL,
  commission_rate DECIMAL,
  referrals JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH network AS (
    SELECT 
      r.level,
      r.referred_id,
      u.username,
      u.avatar_url,
      r.status,
      r.created_at
    FROM social_post.referrals r
    JOIN public.users u ON u.id = r.referred_id
    WHERE r.referrer_id = p_user_id
  ),
  stats AS (
    SELECT 
      n.level,
      n.referred_id,
      COALESCE(SUM(b.amount), 0) as staked,
      COALESCE(SUM(CASE WHEN b.is_won = true THEN b.actual_win ELSE 0 END), 0) as won
    FROM network n
    LEFT JOIN social_post.bets b ON b.user_id = n.referred_id
    WHERE b.status IN ('won', 'lost') OR b.status IS NULL
    GROUP BY n.level, n.referred_id
  ),
  by_level AS (
    SELECT 
      n.level,
      COUNT(DISTINCT n.referred_id) as cnt,
      COALESCE(SUM(s.staked), 0) as total_staked,
      COALESCE(SUM(s.won), 0) as total_won,
      jsonb_agg(jsonb_build_object(
        'id', n.referred_id,
        'username', n.username,
        'avatar_url', n.avatar_url,
        'status', n.status,
        'created_at', n.created_at,
        'staked', COALESCE(s.staked, 0),
        'won', COALESCE(s.won, 0)
      )) as refs
    FROM network n
    LEFT JOIN stats s ON s.referred_id = n.referred_id AND s.level = n.level
    GROUP BY n.level
  )
  SELECT 
    bl.level::INTEGER,
    bl.cnt as referrals_count,
    bl.total_staked,
    bl.total_won,
    bl.total_staked - bl.total_won as net_margin,
    ms.commission_rate,
    bl.refs as referrals
  FROM by_level bl
  JOIN social_post.mlm_settings ms ON ms.level = bl.level
  ORDER BY bl.level;
END;
$$;

-- 5. Get MLM stats (global stats for dashboard)
CREATE OR REPLACE FUNCTION social_post.get_mlm_stats(p_user_id UUID)
RETURNS TABLE(
  total_referrals BIGINT,
  total_n1 BIGINT,
  total_n2 BIGINT,
  total_n3 BIGINT,
  total_staked DECIMAL,
  total_won DECIMAL,
  total_margin DECIMAL,
  total_earnings DECIMAL,
  pending_earnings DECIMAL,
  referral_code TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH network_stats AS (
    SELECT 
      r.level,
      COUNT(*) as cnt,
      COALESCE(SUM(b.amount), 0) as staked,
      COALESCE(SUM(CASE WHEN b.is_won = true THEN b.actual_win ELSE 0 END), 0) as won
    FROM social_post.referrals r
    LEFT JOIN social_post.bets b ON b.user_id = r.referred_id AND b.status IN ('won', 'lost')
    WHERE r.referrer_id = p_user_id
    GROUP BY r.level
  ),
  earnings AS (
    SELECT 
      ns.level,
      ns.cnt,
      ns.staked,
      ns.won,
      ns.staked - ns.won as margin,
      GREATEST(0, (ns.staked - ns.won) * ms.commission_rate) as commission
    FROM network_stats ns
    JOIN social_post.mlm_settings ms ON ms.level = ns.level
  ),
  credited AS (
    SELECT COALESCE(SUM(commission_earned), 0) as total
    FROM social_post.mlm_monthly_stats
    WHERE user_id = p_user_id AND status = 'credited'
  )
  SELECT 
    COALESCE(SUM(e.cnt), 0)::BIGINT as total_referrals,
    COALESCE((SELECT cnt FROM earnings WHERE level = 1), 0)::BIGINT as total_n1,
    COALESCE((SELECT cnt FROM earnings WHERE level = 2), 0)::BIGINT as total_n2,
    COALESCE((SELECT cnt FROM earnings WHERE level = 3), 0)::BIGINT as total_n3,
    COALESCE(SUM(e.staked), 0) as total_staked,
    COALESCE(SUM(e.won), 0) as total_won,
    COALESCE(SUM(e.margin), 0) as total_margin,
    (SELECT total FROM credited) as total_earnings,
    COALESCE(SUM(e.commission), 0) as pending_earnings,
    (SELECT code FROM social_post.referral_codes WHERE user_id = p_user_id) as referral_code
  FROM earnings e;
END;
$$;

-- 6. Calculate monthly commissions (for CRON or manual call)
CREATE OR REPLACE FUNCTION social_post.calculate_monthly_commissions(p_month DATE DEFAULT NULL)
RETURNS TABLE(user_id UUID, level INTEGER, commission DECIMAL, status TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_month DATE;
BEGIN
  v_month := COALESCE(p_month, date_trunc('month', now() - interval '1 month')::date);
  
  RETURN QUERY
  WITH monthly_data AS (
    SELECT 
      r.referrer_id,
      r.level,
      COUNT(DISTINCT r.referred_id) as referrals_count,
      COALESCE(SUM(b.amount), 0) as total_staked,
      COALESCE(SUM(CASE WHEN b.is_won THEN b.actual_win ELSE 0 END), 0) as total_won
    FROM social_post.referrals r
    LEFT JOIN social_post.bets b ON b.user_id = r.referred_id
      AND b.status IN ('won', 'lost')
      AND b.settled_at >= v_month
      AND b.settled_at < v_month + interval '1 month'
    GROUP BY r.referrer_id, r.level
  ),
  with_commission AS (
    SELECT 
      md.referrer_id,
      md.level,
      md.referrals_count,
      md.total_staked,
      md.total_won,
      md.total_staked - md.total_won as net_margin,
      ms.commission_rate,
      GREATEST(0, (md.total_staked - md.total_won) * ms.commission_rate) as commission_earned
    FROM monthly_data md
    JOIN social_post.mlm_settings ms ON ms.level = md.level
    WHERE ms.is_active = true
      AND (md.total_staked - md.total_won) >= ms.min_margin_amount
  )
  INSERT INTO social_post.mlm_monthly_stats (
    user_id, month, level, referrals_count, total_staked, total_won, 
    net_margin, commission_rate, commission_earned, status, credited_at
  )
  SELECT 
    wc.referrer_id, v_month, wc.level, wc.referrals_count::INTEGER, wc.total_staked,
    wc.total_won, wc.net_margin, wc.commission_rate, wc.commission_earned,
    'credited', now()
  FROM with_commission wc
  ON CONFLICT (user_id, month, level) 
  DO UPDATE SET
    referrals_count = EXCLUDED.referrals_count,
    total_staked = EXCLUDED.total_staked,
    total_won = EXCLUDED.total_won,
    net_margin = EXCLUDED.net_margin,
    commission_earned = EXCLUDED.commission_earned,
    status = 'credited',
    credited_at = now()
  RETURNING 
    mlm_monthly_stats.user_id,
    mlm_monthly_stats.level,
    mlm_monthly_stats.commission_earned as commission,
    mlm_monthly_stats.status;
END;
$$;