
-- Create function to calculate prize pool
create or replace function public.calculate_prize_pool(session_id uuid)
returns numeric
language plpgsql
security definer
as $$
declare
  v_entry_fee numeric;
  v_commission_rate numeric;
  v_player_count integer;
begin
  -- Get session details
  select 
    entry_fee,
    commission_rate,
    current_players
  into
    v_entry_fee,
    v_commission_rate,
    v_player_count
  from game_sessions
  where id = session_id;

  -- Calculate and return prize pool
  return (v_entry_fee * v_player_count) * (1 - v_commission_rate/100);
end;
$$;
