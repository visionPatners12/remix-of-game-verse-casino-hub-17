import type { Color } from "../ludoLogic.ts";
import { nowIso } from "./config.ts";
import { LudoHandledError } from "./http.ts";
import { withRetryOnOptimistic, updateGameOptimistic } from "./optimistic.ts";
import {
  activePlayers,
  pickExitRank,
  pickFinishRank,
  winnerByRank1,
  type PlayerRow,
} from "./ranking.ts";

export async function fetchGame(supabase: any, gameId: string) {
  const { data, error } = await supabase.from("ludo_games").select("*").eq("id", gameId).single();
  if (error || !data) throw new LudoHandledError("NOT_FOUND", "Game not found");
  return data;
}

export async function fetchMePlayer(supabase: any, gameId: string, userId: string) {
  const { data, error } = await supabase
    .from("ludo_game_players")
    .select("user_id,color,has_exited,position,turn_order,is_ready")
    .eq("game_id", gameId)
    .eq("user_id", userId)
    .single();

  if (error || !data) throw new LudoHandledError("FORBIDDEN", "Player not found in this game");
  return data as {
    user_id: string;
    color: Color;
    has_exited: boolean;
    position: number | null;
    turn_order: number | null;
    is_ready: boolean | null;
  };
}

export async function fetchPlayers(supabase: any, gameId: string): Promise<PlayerRow[]> {
  const { data, error } = await supabase
    .from("ludo_game_players")
    .select("user_id,color,turn_order,has_exited,position,is_ready")
    .eq("game_id", gameId)
    .order("turn_order");

  if (error) throw new Error("Failed to fetch players");
  return (data ?? []) as any;
}

async function assignPositionIfNull(supabase: any, gameId: string, userId: string, position: number): Promise<boolean> {
  const { data, error } = await supabase
    .from("ludo_game_players")
    .update({ position })
    .eq("game_id", gameId)
    .eq("user_id", userId)
    .is("position", null)
    .select("user_id,position");

  if (error) throw new Error("Failed to assign position");
  return Array.isArray(data) && data.length > 0;
}

export async function assignExitPosition(supabase: any, gameId: string, userId: string) {
  for (let i = 0; i < 3; i++) {
    const players = await fetchPlayers(supabase, gameId);
    const rank = pickExitRank(players);
    if (!rank) return null;
    const ok = await assignPositionIfNull(supabase, gameId, userId, rank);
    if (ok) return rank;
  }
  return null;
}

export async function assignFinishPosition(supabase: any, gameId: string, userId: string) {
  for (let i = 0; i < 3; i++) {
    const players = await fetchPlayers(supabase, gameId);
    const rank = pickFinishRank(players);
    if (!rank) return null;
    const ok = await assignPositionIfNull(supabase, gameId, userId, rank);
    if (ok) return rank;
  }
  return null;
}

/**
 * ✅ Fin de partie quand active <= 1
 * + garde-fou: ne jamais finaliser si la partie n’a pas au moins 2 joueurs
 */
export async function finalizeGameIfNeeded(supabase: any, gameId: string) {
  return await withRetryOnOptimistic(async () => {
    const game = await fetchGame(supabase, gameId);
    if (game.status !== "active") return { finished: false as const };

    const players = await fetchPlayers(supabase, gameId);
    if ((players?.length ?? 0) < 2) return { finished: false as const };

    const active = activePlayers(players);
    if (active.length >= 2) return { finished: false as const };

    if (active.length === 1) {
      await assignFinishPosition(supabase, gameId, active[0].user_id);
    }

    const players2 = await fetchPlayers(supabase, gameId);
    let winner = winnerByRank1(players2);

    if (!winner) {
      const fallback = players2.find((p) => (p.has_exited ?? false) === false) ?? players2[0];
      if (!fallback) return { finished: false as const };
      await assignPositionIfNull(supabase, gameId, fallback.user_id, 1);
      const players3 = await fetchPlayers(supabase, gameId);
      winner = winnerByRank1(players3) ?? fallback;
    }

    await updateGameOptimistic(
      supabase,
      gameId,
      { rev: game.rev ?? 0 },
      {
        status: "finished",
        winner: winner.color,
        winner_user_id: winner.user_id,
        finished_at: nowIso(),
        dice: null,
        claim_tx_hash: null,
        claim_status: null,
      },
      "id,rev,status,winner,winner_user_id",
    );

    return { finished: true as const, winner };
  });
}

// --- Helpers Start ---
export function pickStartTurnColorFromPlayers(players: any[]): Color {
  const eligible = players
    .filter((p) => (p.has_exited ?? false) === false && p.position == null)
    .sort((a, b) => (a.turn_order ?? 999) - (b.turn_order ?? 999));

  // préférence pour R si présent, sinon 1er par turn_order
  const r = eligible.find((p) => p.color === "R");
  return (r?.color ?? eligible[0]?.color ?? "R") as Color;
}

/**
 * wallet lookup (users puis profiles)
 */
export async function getWalletAddressFromDb(supabase: any, userId: string): Promise<string | null> {
  {
    const { data, error } = await supabase.from("users").select("wallet_address").eq("id", userId).maybeSingle();
    if (!error && data?.wallet_address) return data.wallet_address;
  }
  {
    const { data, error } = await supabase.from("profiles").select("wallet_address").eq("id", userId).maybeSingle();
    if (!error && data?.wallet_address) return data.wallet_address;
  }
  return null;
}
