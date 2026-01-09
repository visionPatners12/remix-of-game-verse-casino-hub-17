
-- Create function for checking and settling p2p bets
CREATE OR REPLACE FUNCTION public.check_p2p_bets_for_settlement()
RETURNS TABLE(bet_id uuid, match_id bigint, creator_id uuid, opponent_id uuid, result text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  settled_count INTEGER := 0;
BEGIN
  -- Create temporary table to store results
  CREATE TEMP TABLE tmp_settled_bets(
    bet_id uuid,
    match_id bigint,
    creator_id uuid,
    opponent_id uuid,
    result text
  ) ON COMMIT DROP;

  -- Update bets for completed matches
  WITH completed_matches AS (
    SELECT 
      sm.id AS match_id,
      sm.status,
      sm.scores,
      sm.data
    FROM 
      sport_matches sm
    WHERE 
      sm.status IN ('FT', 'AET', 'FT_PEN') -- Full Time, After Extra Time, Penalties
    AND
      sm.scores IS NOT NULL
  ),
  active_bets AS (
    SELECT 
      pb.id,
      pb.creator_id,
      pb.opponent_id,
      pb.match_id,
      pb.market_type_id,
      pb.creator_prediction,
      pb.opponent_prediction,
      pb.amount_creator,
      pb.amount_opponent,
      pb.status
    FROM 
      p2p_bets pb
    WHERE 
      pb.status = 'active'
  ),
  bets_to_settle AS (
    SELECT 
      ab.*,
      cm.scores,
      cm.data,
      mt.developer_name AS market_type_name,
      mt.has_winning_calculations
    FROM 
      active_bets ab
    JOIN 
      completed_matches cm ON ab.match_id = cm.match_id
    JOIN
      market_types mt ON ab.market_type_id = mt.id
  )
  
  -- Process each bet that needs to be settled - simplified with creator always winning
  -- This is a temporary simplification as requested
  INSERT INTO tmp_settled_bets(bet_id, match_id, creator_id, opponent_id, result)
  SELECT 
    id,
    match_id,
    creator_id,
    opponent_id,
    'creator' AS result
  FROM 
    bets_to_settle;

  -- Update the p2p_bets table with results
  UPDATE p2p_bets
  SET 
    status = 'completed',
    result = t.result::p2p_bet_result,
    completed_at = NOW()
  FROM 
    tmp_settled_bets t
  WHERE 
    p2p_bets.id = t.bet_id;
    
  -- Process payouts for each settled bet
  WITH settled_bets AS (
    SELECT * FROM tmp_settled_bets
  ),
  bet_details AS (
    SELECT 
      pb.id AS bet_id,
      pb.result,
      pb.amount_creator,
      pb.amount_opponent,
      pb.creator_id,
      pb.opponent_id,
      pb.commission_rate
    FROM 
      p2p_bets pb
    JOIN 
      settled_bets sb ON pb.id = sb.bet_id
    WHERE 
      pb.status = 'completed'
  )
  
  -- Create transactions and update wallet balances
  INSERT INTO bet_transactions (bet_id, user_id, amount, type)
  SELECT
    bd.bet_id,
    CASE 
      WHEN bd.result = 'creator' THEN bd.creator_id
      WHEN bd.result = 'opponent' THEN bd.opponent_id
      ELSE NULL -- void case
    END AS user_id,
    CASE
      WHEN bd.result = 'creator' THEN bd.amount_creator + COALESCE(bd.amount_opponent, 0) * (1 - bd.commission_rate/100)
      WHEN bd.result = 'opponent' THEN COALESCE(bd.amount_opponent, 0) + bd.amount_creator * (1 - bd.commission_rate/100)
      WHEN bd.result = 'void' THEN bd.amount_creator -- return creator bet if void
    END AS amount,
    'bet_settlement' AS type
  FROM
    bet_details bd
  WHERE
    bd.result IS NOT NULL;
  
  -- Update wallet balances for winning bets
  WITH bet_transactions_summary AS (
    SELECT
      bt.user_id,
      SUM(bt.amount) AS total_amount
    FROM
      bet_transactions bt
    JOIN
      tmp_settled_bets tsb ON bt.bet_id = tsb.bet_id
    WHERE
      bt.type = 'bet_settlement'
    GROUP BY
      bt.user_id
  )
  
  UPDATE wallets w
  SET real_balance = real_balance + bts.total_amount
  FROM bet_transactions_summary bts
  WHERE w.user_id = bts.user_id;
  
  -- Handle void bets for opponent (return their stake)
  WITH void_bets AS (
    SELECT
      pb.id AS bet_id,
      pb.opponent_id,
      pb.amount_opponent
    FROM
      p2p_bets pb
    JOIN
      tmp_settled_bets tsb ON pb.id = tsb.bet_id
    WHERE
      pb.result = 'void'
      AND pb.opponent_id IS NOT NULL
      AND pb.amount_opponent IS NOT NULL
  )
  
  INSERT INTO bet_transactions (bet_id, user_id, amount, type)
  SELECT
    vb.bet_id,
    vb.opponent_id,
    vb.amount_opponent,
    'bet_void_refund'
  FROM
    void_bets vb;
  
  -- Update wallet balances for void bet refunds
  WITH void_refund_summary AS (
    SELECT
      bt.user_id,
      SUM(bt.amount) AS total_amount
    FROM
      bet_transactions bt
    JOIN
      tmp_settled_bets tsb ON bt.bet_id = tsb.bet_id
    WHERE
      bt.type = 'bet_void_refund'
    GROUP BY
      bt.user_id
  )
  
  UPDATE wallets w
  SET real_balance = real_balance + vrs.total_amount
  FROM void_refund_summary vrs
  WHERE w.user_id = vrs.user_id;
  
  -- Return the results
  RETURN QUERY SELECT * FROM tmp_settled_bets;
END;
$$;

-- Ensure the function is owned by postgres
ALTER FUNCTION public.check_p2p_bets_for_settlement() OWNER TO postgres;
