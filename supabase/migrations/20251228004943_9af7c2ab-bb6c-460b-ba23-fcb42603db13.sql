-- 1. Add referral_code column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- 2. Create referrals table for MLM network tracking
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  n1_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  n2_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  n3_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS policies for referrals
CREATE POLICY "Users can view their own referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Service can manage referrals"
  ON public.referrals FOR ALL
  USING (true)
  WITH CHECK (true);

-- 3. Create function to auto-generate referral code
CREATE OR REPLACE FUNCTION public.generate_auto_referral_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code TEXT;
  base_code TEXT;
BEGIN
  -- Generate base code from username or random
  IF NEW.username IS NOT NULL AND LENGTH(NEW.username) >= 3 THEN
    base_code := UPPER(LEFT(REGEXP_REPLACE(NEW.username, '[^a-zA-Z0-9]', '', 'g'), 4));
  ELSE
    base_code := UPPER(SUBSTRING(md5(random()::text), 1, 4));
  END IF;
  
  -- Add random suffix
  new_code := base_code || UPPER(SUBSTRING(md5(NEW.id::text || random()::text), 1, 4));
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.users WHERE referral_code = new_code AND id != NEW.id) LOOP
    new_code := UPPER(SUBSTRING(md5(random()::text), 1, 8));
  END LOOP;
  
  NEW.referral_code := new_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Create trigger for new users
DROP TRIGGER IF EXISTS on_user_created_generate_referral_code ON public.users;
CREATE TRIGGER on_user_created_generate_referral_code
  BEFORE INSERT ON public.users
  FOR EACH ROW
  WHEN (NEW.referral_code IS NULL)
  EXECUTE FUNCTION public.generate_auto_referral_code();

-- 5. Generate codes for existing users without one
UPDATE public.users 
SET referral_code = UPPER(
  COALESCE(LEFT(REGEXP_REPLACE(username, '[^a-zA-Z0-9]', '', 'g'), 4), '') 
  || SUBSTRING(md5(id::text || random()::text), 1, 4)
)
WHERE referral_code IS NULL;

-- 6. Create get_mlm_stats function
CREATE OR REPLACE FUNCTION public.get_mlm_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  user_code TEXT;
  n1_count INT;
  n2_count INT;
  n3_count INT;
BEGIN
  -- Get user's referral code
  SELECT referral_code INTO user_code FROM public.users WHERE id = p_user_id;
  
  -- Count referrals at each level
  SELECT COUNT(*) INTO n1_count FROM public.referrals WHERE n1_id = p_user_id;
  SELECT COUNT(*) INTO n2_count FROM public.referrals WHERE n2_id = p_user_id;
  SELECT COUNT(*) INTO n3_count FROM public.referrals WHERE n3_id = p_user_id;
  
  -- Build result
  SELECT json_build_object(
    'total_referrals', COALESCE(n1_count, 0),
    'total_n1', COALESCE(n1_count, 0),
    'total_n2', COALESCE(n2_count, 0),
    'total_n3', COALESCE(n3_count, 0),
    'total_staked', 0,
    'total_won', 0,
    'total_margin', 0,
    'total_earnings', 0,
    'pending_earnings', 0,
    'referral_code', user_code
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. Create validate_referral_code function
CREATE OR REPLACE FUNCTION public.validate_referral_code(p_code TEXT)
RETURNS JSON AS $$
DECLARE
  referrer RECORD;
BEGIN
  SELECT id, username INTO referrer 
  FROM public.users 
  WHERE referral_code = UPPER(TRIM(p_code));
  
  IF referrer.id IS NULL THEN
    RETURN json_build_object('is_valid', false, 'referrer_id', NULL, 'referrer_username', NULL);
  END IF;
  
  RETURN json_build_object(
    'is_valid', true,
    'referrer_id', referrer.id,
    'referrer_username', referrer.username
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. Create process_referral_signup function
CREATE OR REPLACE FUNCTION public.process_referral_signup(p_referred_id UUID, p_code TEXT)
RETURNS JSON AS $$
DECLARE
  v_referrer_id UUID;
  v_n1 UUID;
  v_n2 UUID;
  v_n3 UUID;
  existing_referral UUID;
BEGIN
  -- Check if already referred
  SELECT id INTO existing_referral FROM public.referrals WHERE referred_id = p_referred_id;
  IF existing_referral IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Already referred');
  END IF;

  -- Find referrer by code
  SELECT id INTO v_referrer_id FROM public.users WHERE referral_code = UPPER(TRIM(p_code));
  
  IF v_referrer_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid code');
  END IF;
  
  -- Can't refer yourself
  IF v_referrer_id = p_referred_id THEN
    RETURN json_build_object('success', false, 'error', 'Cannot refer yourself');
  END IF;
  
  -- Get referrer's chain (their N1, N2 become our N2, N3)
  SELECT n1_id, n2_id INTO v_n1, v_n2 
  FROM public.referrals WHERE referred_id = v_referrer_id;
  
  -- Insert new referral with hierarchy
  INSERT INTO public.referrals (referrer_id, referred_id, n1_id, n2_id, n3_id)
  VALUES (v_referrer_id, p_referred_id, v_referrer_id, v_n1, v_n2);
  
  RETURN json_build_object(
    'success', true,
    'n1', v_referrer_id,
    'n2', v_n1,
    'n3', v_n2
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 9. Create generate_referral_code function (for compatibility, regenerates if needed)
CREATE OR REPLACE FUNCTION public.generate_referral_code(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  existing_code TEXT;
  new_code TEXT;
BEGIN
  -- Check if user already has a code
  SELECT referral_code INTO existing_code FROM public.users WHERE id = p_user_id;
  
  IF existing_code IS NOT NULL THEN
    RETURN existing_code;
  END IF;
  
  -- Generate new code
  new_code := UPPER(SUBSTRING(md5(p_user_id::text || random()::text), 1, 8));
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.users WHERE referral_code = new_code) LOOP
    new_code := UPPER(SUBSTRING(md5(random()::text), 1, 8));
  END LOOP;
  
  -- Update user
  UPDATE public.users SET referral_code = new_code WHERE id = p_user_id;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;