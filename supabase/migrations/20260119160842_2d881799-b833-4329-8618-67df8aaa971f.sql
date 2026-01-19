-- Enrich validate_referral_code to return full referrer profile info
-- This function is used in onboarding to show "Invited by" screen

CREATE OR REPLACE FUNCTION public.validate_referral_code(p_code TEXT)
RETURNS JSON AS $$
DECLARE
  referrer RECORD;
BEGIN
  SELECT id, username, first_name, last_name, avatar_url 
  INTO referrer 
  FROM public.users 
  WHERE referral_code = UPPER(TRIM(p_code));
  
  IF referrer.id IS NULL THEN
    RETURN json_build_object(
      'is_valid', false, 
      'referrer_id', NULL, 
      'referrer_username', NULL,
      'referrer_first_name', NULL,
      'referrer_last_name', NULL,
      'referrer_avatar_url', NULL
    );
  END IF;
  
  RETURN json_build_object(
    'is_valid', true,
    'referrer_id', referrer.id,
    'referrer_username', referrer.username,
    'referrer_first_name', referrer.first_name,
    'referrer_last_name', referrer.last_name,
    'referrer_avatar_url', referrer.avatar_url
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;