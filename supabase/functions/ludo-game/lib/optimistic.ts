import { nowIso } from "./config.ts";
import { LudoHandledError } from "./http.ts";

export async function withRetryOnOptimistic<T>(fn: () => Promise<T>, tries = 3) {
  let lastErr: any;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e: any) {
      lastErr = e;
      if (e instanceof LudoHandledError && e.code === "RETRY") {
        await new Promise((r) => setTimeout(r, 80 + Math.floor(Math.random() * 120)));
        continue;
      }
      throw e;
    }
  }
  throw lastErr;
}

/**
 * ✅ update optimistic lock (PAS de .single())
 * - 0 row updated => RETRY
 */
export async function updateGameOptimistic(
  supabase: any,
  gameId: string,
  expected: {
    rev: number;
    status?: string;
    turn?: string;
    dice?: number | null;
    diceMustBeNull?: boolean;
    claim_tx_hash?: string | null;
  },
  patch: Record<string, unknown>,
  selectCols =
    "id,rev,turn,dice,positions,status,winner,winner_user_id,turn_started_at,extra_turn_on_six,claim_tx_hash,claim_status,started_at,finished_at,current_players,max_players,room_code,is_public,bet_amount,pot",
) {
  let q = supabase
    .from("ludo_games")
    .update({
      ...patch,
      rev: (expected.rev ?? 0) + 1,
      last_activity_at: nowIso(),
    })
    .eq("id", gameId)
    .eq("rev", expected.rev ?? 0);

  if (expected.status !== undefined) q = q.eq("status", expected.status);
  if (expected.turn !== undefined) q = q.eq("turn", expected.turn);

  if (expected.diceMustBeNull) q = q.is("dice", null);
  else if (expected.dice !== undefined) q = q.eq("dice", expected.dice);

  if (expected.claim_tx_hash !== undefined) {
    if (expected.claim_tx_hash === null) q = q.is("claim_tx_hash", null);
    else q = q.eq("claim_tx_hash", expected.claim_tx_hash);
  }

  const { data, error } = await q.select(selectCols);

  if (error) {
    if (error.code === "PGRST116") {
      throw new LudoHandledError("RETRY", "Game state changed, retry", { gameId, expected });
    }
    throw new Error(error.message);
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new LudoHandledError("RETRY", "Game state changed, retry", { gameId, expected });

  return row;
}
