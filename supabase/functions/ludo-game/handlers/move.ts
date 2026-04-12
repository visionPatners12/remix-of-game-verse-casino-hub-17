import { jsonOk, LudoHandledError } from "../lib/http.ts";
import { nowIso } from "../lib/config.ts";
import { withRetryOnOptimistic, updateGameOptimistic } from "../lib/optimistic.ts";
import {
  fetchGame,
  fetchMePlayer,
  fetchPlayers,
  assignFinishPosition,
  finalizeGameIfNeeded,
} from "../lib/db.ts";
import { activePlayers, pickNextTurnColor } from "../lib/ranking.ts";

import {
  type Color,
  type GameState,
  GOAL,
  calculateMove,
  getNextPrisonSlot,
} from "../ludoLogic.ts";

export async function handleMove(body: any, supabase: any, user: any) {
  const { gameId, pawnIndex } = body;
  if (!gameId || pawnIndex === undefined) {
    throw new LudoHandledError("BAD_REQUEST", "gameId and pawnIndex required");
  }

  const pi = Number(pawnIndex);
  if (!Number.isInteger(pi) || pi < 0 || pi > 3) {
    throw new LudoHandledError("BAD_REQUEST", "pawnIndex must be 0..3");
  }

  const game = await fetchGame(supabase, gameId);
  if (game.status !== "active") throw new LudoHandledError("BAD_STATE", "Game is not active");
  if (game.dice == null) throw new LudoHandledError("BAD_STATE", "No dice value available");

  const me = await fetchMePlayer(supabase, gameId, user.id);
  if (me.has_exited) throw new LudoHandledError("FORBIDDEN", "You exited");
  if (me.position != null) throw new LudoHandledError("FORBIDDEN", "You already finished");
  if (me.color !== game.turn) throw new LudoHandledError("FORBIDDEN", "Not your turn");

  const moverColor = me.color as Color;
  const gameState: GameState = game.positions as GameState;

  const moveResult = calculateMove(gameState, moverColor, pi, Number(game.dice));
  if (!moveResult.valid) throw new LudoHandledError("INVALID_MOVE", moveResult.reason || "Invalid move");

  const newState: GameState = {
    R: [...gameState.R],
    G: [...gameState.G],
    Y: [...gameState.Y],
    B: [...gameState.B],
  };

  newState[moverColor][pi] = moveResult.newPosition;

  // ✅ capture -> prison DU CAPTUREUR
  if (moveResult.capturedPawn) {
    const { color: capturedColor, pawnIndex: capturedIndex } = moveResult.capturedPawn;
    const prisonSlot = getNextPrisonSlot(newState, moverColor);
    newState[capturedColor][capturedIndex] = prisonSlot;
  }

  const moverFinishedNow = newState[moverColor].every((v) => v === GOAL);
  if (moverFinishedNow) {
    await assignFinishPosition(supabase, gameId, user.id);
  }

  const players = await fetchPlayers(supabase, gameId);
  const active = activePlayers(players);

  const capturedPawn = !!moveResult.capturedPawn;
  const rolledSix = Number(game.dice) === 6;
  const extraTurnsEnabled = game.extra_turn_on_six !== false;

  const keepsTurn = !moverFinishedNow && (capturedPawn || (rolledSix && extraTurnsEnabled));
  const nextTurn = keepsTurn
    ? (game.turn as Color)
    : (pickNextTurnColor(active, game.turn as Color) as Color);

  await withRetryOnOptimistic(() =>
    updateGameOptimistic(
      supabase,
      gameId,
      { rev: game.rev ?? 0, turn: game.turn, dice: game.dice },
      { positions: newState, turn: nextTurn, dice: null, turn_started_at: nowIso() }, // ✅ obligatoire
      "id,rev,turn,turn_started_at",
    ),
  );

  const fin = await finalizeGameIfNeeded(supabase, gameId);

  return jsonOk({
    ok: true,
    action: "moved",
    moveResult,
    nextTurn,
    moverFinishedNow,
    finished: fin.finished,
    winner: fin.finished ? fin.winner.color : null,
    winner_user_id: fin.finished ? fin.winner.user_id : null,
  });
}
