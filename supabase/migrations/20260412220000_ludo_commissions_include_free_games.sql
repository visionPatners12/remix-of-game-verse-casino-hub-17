-- Referral commissions on finished Ludo games: include FREE games.
-- Staked games: % of actual bet_amount. Free games: same rates applied to a small notional base (1.0)
-- so commission_amount is non-zero; bet_amount column still stores 0 for disclosure / staked stats.

CREATE OR REPLACE FUNCTION public.calculate_ludo_commissions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_player RECORD;
  v_referrer_n1 UUID;
  v_referrer_n2 UUID;
  v_rate_n1 DECIMAL := 0.015;
  v_rate_n2 DECIMAL := 0.005;
  v_bet_amount DECIMAL;
  v_base DECIMAL;
  -- USDC-equivalent notional stake for % on free games (bet_amount stays 0 in rows)
  notional_free_base NUMERIC := 1.0;
BEGIN
  IF NEW.status = 'finished' AND (OLD.status IS NULL OR OLD.status <> 'finished') THEN

    v_bet_amount := COALESCE(NEW.bet_amount, 0);
    v_base := CASE
      WHEN v_bet_amount > 0 THEN v_bet_amount
      ELSE notional_free_base
    END;

    FOR v_player IN
      SELECT lgp.user_id
      FROM public.ludo_game_players lgp
      WHERE lgp.game_id = NEW.id
        AND lgp.user_id IS NOT NULL
    LOOP
      SELECT referrer_id INTO v_referrer_n1
      FROM public.referrals
      WHERE referred_id = v_player.user_id
      LIMIT 1;

      IF v_referrer_n1 IS NOT NULL THEN
        INSERT INTO public.ludo_commissions
          (beneficiary_id, player_id, game_id, level,
           bet_amount, commission_rate, commission_amount, status)
        VALUES
          (v_referrer_n1, v_player.user_id, NEW.id, 1,
           v_bet_amount, v_rate_n1, v_base * v_rate_n1, 'pending')
        ON CONFLICT (game_id, beneficiary_id, level) DO NOTHING;

        SELECT referrer_id INTO v_referrer_n2
        FROM public.referrals
        WHERE referred_id = v_referrer_n1
        LIMIT 1;

        IF v_referrer_n2 IS NOT NULL THEN
          INSERT INTO public.ludo_commissions
            (beneficiary_id, player_id, game_id, level,
             bet_amount, commission_rate, commission_amount, status)
          VALUES
            (v_referrer_n2, v_player.user_id, NEW.id, 2,
             v_bet_amount, v_rate_n2, v_base * v_rate_n2, 'pending')
          ON CONFLICT (game_id, beneficiary_id, level) DO NOTHING;
        END IF;
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;
