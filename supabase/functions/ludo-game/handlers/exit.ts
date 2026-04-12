import { jsonOk, LudoHandledError } from "../lib/http.ts";
import { nowIso } from "../lib/config.ts";
import { withRetryOnOptimistic, updateGameOptimistic } from "../lib/optimistic.ts";
import {
  fetchGame,
  fetchMePlayer,
  fetchPlayers,
  assignExitPosition,
  finalizeGameIfNeeded,
} from "../lib/db.ts";
import { activePlayers, pickNextTurnColor } from "../lib/ranking.ts";
import type { Color } from "../ludoLogic.ts";

export async function handleExit(body: any, supabase: any, user: any) {
  const { gameId } = body;
  if (!gameId) throw new LudoHandledError("BAD_REQUEST", "Game ID is required");

  const game = await fetchGame(supabase, gameId);

  // =========================================================
  // ✅ CASE A: GAME NOT STARTED (status = created) => LEAVE LOBBY
  // - delete row in ludo_game_players
  // - if no player left => delete game
  // - optional: if creator left => transfer created_by
  // =========================================================
  if (game.status === "created") {
    // must be player
    const { data: meRow, error: meErr } = await supabase
      .from("ludo_game_players")
      .select("user_id,color,turn_order")
      .eq("game_id", gameId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (meErr) throw new Error("Failed to read player");
    if (!meRow) throw new LudoHandledError("FORBIDDEN", "Player not found in this game");

    // delete player row (leave lobby)
    const { error: delErr } = await supabase
      .from("ludo_game_players")
      .delete()
      .eq("game_id", gameId)
      .eq("user_id", user.id);

    if (delErr) throw new Error("Failed to leave game");

    // remaining players count
    const { count, error: cntErr } = await supabase
      .from("ludo_game_players")
      .select("id", { count: "exact", head: true })
      .eq("game_id", gameId);

    if (cntErr) throw new Error("Failed to count remaining players");

    const remaining = count ?? 0;

    // if empty lobby => delete the game
    if (remaining === 0) {
      await supabase.from("ludo_games").delete().eq("id", gameId);
      return jsonOk({
        ok: true,
        action: "left",
        status: "created",
        gameDeleted: true,
        remainingPlayers: 0,
      });
    }

    // optional: transfer ownership if creator left
    if (game.created_by === user.id) {
      const { data: first, error: firstErr } = await supabase
        .from("ludo_game_players")
        .select("user_id")
        .eq("game_id", gameId)
        .order("turn_order", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!firstErr && first?.user_id) {
        // optimistic to avoid concurrent updates
        await withRetryOnOptimistic(() =>
          updateGameOptimistic(
            supabase,
            gameId,
            { rev: game.rev ?? 0, status: "created" },
            { created_by: first.user_id },
            "id,rev,created_by",
          ),
        );
      }
    }

    return jsonOk({
      ok: true,
      action: "left",
      status: "created",
      gameDeleted: false,
      remainingPlayers: remaining,
    });
  }

  // =========================================================
  // ✅ CASE B: GAME STARTED (status = active) => EXIT IN-GAME
  // =========================================================
  if (game.status !== "active") throw new LudoHandledError("BAD_STATE", "Game is not active");

  const me = await fetchMePlayer(supabase, gameId, user.id);
  if (me.has_exited) return jsonOk({ ok: true, action: "already_exited", position: me.position });
  if (me.position != null) throw new LudoHandledError("FORBIDDEN", "You already finished; cannot exit");

  // 1) mark exited
  const { error: exitErr } = await supabase
    .from("ludo_game_players")
    .update({ has_exited: true })
    .eq("game_id", gameId)
    .eq("user_id", user.id);

  if (exitErr) throw new Error("Failed to exit");

  // 2) assign last available position
  const exitPos = await assignExitPosition(supabase, gameId, user.id);

  // 3) heal turn if it was his turn
  if (game.turn === me.color) {
    const players = await fetchPlayers(supabase, gameId);
    const active = activePlayers(players);
    const nextTurn = active.length ? (pickNextTurnColor(active, me.color as Color) as Color) : null;

    if (nextTurn) {
      await withRetryOnOptimistic(() =>
        updateGameOptimistic(
          supabase,
          gameId,
          { rev: game.rev ?? 0, turn: game.turn },
          { turn: nextTurn, dice: null, turn_started_at: nowIso() }, // ✅ reset
          "id,rev,turn,turn_started_at",
        ),
      );
    }
  }

  // 4) finalize if needed
  const fin = await finalizeGameIfNeeded(supabase, gameId);

  return jsonOk({
    ok: true,
    action: "exited",
    status: "active",
    exit_position: exitPos,
    finished: fin.finished,
    winner: fin.finished ? fin.winner.color : null,
    winner_user_id: fin.finished ? fin.winner.user_id : null,
  });
}
