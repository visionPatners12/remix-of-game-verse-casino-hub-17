import { jsonOk, LudoHandledError } from "../lib/http.ts";
import { nowIso } from "../lib/config.ts";
import { withRetryOnOptimistic, updateGameOptimistic } from "../lib/optimistic.ts";
import { fetchGame, fetchPlayers, pickStartTurnColorFromPlayers } from "../lib/db.ts";

export async function handleStart(body: any, supabase: any, user: any) {
  const { gameId } = body;
  if (!gameId) throw new LudoHandledError("BAD_REQUEST", "Game ID is required");

  const game = await fetchGame(supabase, gameId);

  // 1) status created
  if (game.status !== "created") {
    throw new LudoHandledError("BAD_STATE", "Game must be in 'created' status to start", {
      status: game.status,
    });
  }

  // 2) players
  const players = await fetchPlayers(supabase, gameId);

  // eligible = pas exited + pas finished
  const eligible = players.filter((p: any) => (p.has_exited ?? false) === false && p.position == null);

  if (eligible.length < 2) {
    throw new LudoHandledError("BAD_STATE", "Need at least 2 active players to start", {
      active_players: eligible.length,
    });
  }

  // 3) tous ready
  const notReady = eligible.filter((p: any) => (p.is_ready ?? false) !== true);
  if (notReady.length > 0) {
    throw new LudoHandledError("BAD_STATE", "All players must be ready to start", {
      not_ready_user_ids: notReady.map((x: any) => x.user_id),
    });
  }

  // 4) choisir le premier turn
  const firstTurn = pickStartTurnColorFromPlayers(players);

  // 5) update atomique via optimistic (évite double start)
  const started = await withRetryOnOptimistic(() =>
    updateGameOptimistic(
      supabase,
      gameId,
      { rev: game.rev ?? 0, status: "created" }, // ✅ empêche double start
      {
        status: "active",
        started_at: nowIso(),
        turn_started_at: nowIso(), // ✅ CRITIQUE
        turn: firstTurn,
        dice: null,
        winner: null,
        winner_user_id: null,
        finished_at: null,
        claim_tx_hash: null,
        claim_status: null,
      },
      "id,rev,status,turn,started_at,turn_started_at,dice",
    ),
  );

  return jsonOk({
    ok: true,
    action: "started",
    game: started,
  });
}
