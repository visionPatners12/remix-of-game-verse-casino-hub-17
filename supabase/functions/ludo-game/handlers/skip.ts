// supabase/functions/ludo-game/handlers/skip.ts

import { jsonOk, LudoHandledError } from "../lib/http.ts";
import { nowIso, rollDiceCrypto, pickRandomIndex } from "../lib/config.ts";
import { withRetryOnOptimistic, updateGameOptimistic } from "../lib/optimistic.ts";
import { fetchGame, fetchPlayers, finalizeGameIfNeeded, assignFinishPosition } from "../lib/db.ts";
import { activePlayers, pickNextTurnColor } from "../lib/ranking.ts";

import {
  type Color,
  type GameState,
  GOAL,
  calculateMove,
  getNextPrisonSlot,
} from "../ludoLogic.ts";

export async function handleSkipAutoPlay(body: any, supabase: any, user: any) {
  const { gameId } = body;
  if (!gameId) throw new LudoHandledError("BAD_REQUEST", "Game ID is required");

  let game = await fetchGame(supabase, gameId);
  if (game.status !== "active") throw new LudoHandledError("BAD_STATE", "Game is not active");

  // caller must be player AND not exited
  const { data: caller, error: callerErr } = await supabase
    .from("ludo_game_players")
    .select("user_id,has_exited,position")
    .eq("game_id", gameId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (callerErr) throw new Error("Failed to verify caller");
  if (!caller) throw new LudoHandledError("FORBIDDEN", "Only players in this game can call skip");
  if (caller.has_exited) throw new LudoHandledError("FORBIDDEN", "Exited players cannot call skip");
  if (caller.position != null) throw new LudoHandledError("FORBIDDEN", "Finished players cannot call skip");

  // active players
  const players0 = await fetchPlayers(supabase, gameId);
  const active0 = activePlayers(players0);

  if (active0.length <= 1) {
    const fin0 = await finalizeGameIfNeeded(supabase, gameId);
    return jsonOk({
      ok: true,
      action: "aborted_or_finished",
      finished: fin0.finished,
      winner: fin0.finished ? fin0.winner.color : null,
      winner_user_id: fin0.finished ? fin0.winner.user_id : null,
    });
  }

  // heal turn if current turn not active
  let turnColor = game.turn as Color;
  if (!active0.some((p) => p.color === turnColor)) {
    const healed = active0[0].color;
    game = await withRetryOnOptimistic(() =>
      updateGameOptimistic(
        supabase,
        gameId,
        { rev: game.rev ?? 0 },
        { turn: healed, dice: null, turn_started_at: nowIso() },
        "id,rev,turn,dice,positions,extra_turn_on_six,status,turn_started_at",
      ),
    );
    turnColor = healed;
  }

  // roll if needed
  let diceValue: number | null = game.dice == null ? null : Number(game.dice);
  if (diceValue === null) {
    const rolled = rollDiceCrypto();
    game = await withRetryOnOptimistic(() =>
      updateGameOptimistic(
        supabase,
        gameId,
        { rev: game.rev ?? 0, turn: game.turn, diceMustBeNull: true },
        { dice: rolled },
        "id,rev,turn,dice,positions,extra_turn_on_six,status,turn_started_at",
      ),
    );
    diceValue = rolled;
  }

  const gameState: GameState = game.positions as GameState;

  // valid moves
  const validPawnIndices: number[] = [];
  for (let i = 0; i < gameState[turnColor].length; i++) {
    if (calculateMove(gameState, turnColor, i, Number(diceValue)).valid) validPawnIndices.push(i);
  }

  // ✅ no move => ALWAYS pass to next player (even if dice=6)
  if (validPawnIndices.length === 0) {
    const players = await fetchPlayers(supabase, gameId);
    const active = activePlayers(players);

    const nextTurn = pickNextTurnColor(active, turnColor) as Color;

    await withRetryOnOptimistic(() =>
      updateGameOptimistic(
        supabase,
        gameId,
        { rev: game.rev ?? 0, turn: game.turn, dice: game.dice },
        { turn: nextTurn, dice: null, turn_started_at: nowIso() }, // ✅ reset timer
        "id,rev,turn,dice,turn_started_at",
      ),
    );

    const fin = await finalizeGameIfNeeded(supabase, gameId);

    return jsonOk({
      ok: true,
      action: "auto_no_move",
      diceValue,
      nextTurn,
      finished: fin.finished,
      winner: fin.finished ? fin.winner.color : null,
      winner_user_id: fin.finished ? fin.winner.user_id : null,
    });
  }

  // play random valid pawn
  const pawnIndex = validPawnIndices[pickRandomIndex(validPawnIndices.length)];
  const moveResult = calculateMove(gameState, turnColor, pawnIndex, Number(diceValue));
  if (!moveResult.valid) throw new LudoHandledError("INVALID_MOVE", moveResult.reason || "Invalid move");

  const newState: GameState = { R: [...gameState.R], G: [...gameState.G], Y: [...gameState.Y], B: [...gameState.B] };
  newState[turnColor][pawnIndex] = moveResult.newPosition;

  // ✅ capture -> prison of CAPTURER
  if (moveResult.capturedPawn) {
    const { color: capturedColor, pawnIndex: capturedIndex } = moveResult.capturedPawn;
    const prisonSlot = getNextPrisonSlot(newState, turnColor);
    newState[capturedColor][capturedIndex] = prisonSlot;
  }

  const finishedNow = newState[turnColor].every((v) => v === GOAL);
  if (finishedNow) {
    const players = await fetchPlayers(supabase, gameId);
    const p = players.find((x) => x.color === turnColor);
    if (p?.user_id) await assignFinishPosition(supabase, gameId, p.user_id);
  }

  const players1 = await fetchPlayers(supabase, gameId);
  const active1 = activePlayers(players1);

  const capturedPawn = !!moveResult.capturedPawn;
  const rolledSix = Number(diceValue) === 6;
  const extraTurnsEnabled = game.extra_turn_on_six !== false;

  const keepsTurn = !finishedNow && (capturedPawn || (rolledSix && extraTurnsEnabled));
  const nextTurn = keepsTurn ? turnColor : (pickNextTurnColor(active1, turnColor) as Color);

  await withRetryOnOptimistic(() =>
    updateGameOptimistic(
      supabase,
      gameId,
      { rev: game.rev ?? 0, turn: game.turn, dice: game.dice },
      { positions: newState, turn: nextTurn, dice: null, turn_started_at: nowIso() }, // ✅ reset timer
      "id,rev",
    ),
  );

  const fin = await finalizeGameIfNeeded(supabase, gameId);

  return jsonOk({
    ok: true,
    action: "auto_played",
    diceValue,
    pawnIndex,
    nextTurn,
    finishedNow,
    finished: fin.finished,
    winner: fin.finished ? fin.winner.color : null,
    winner_user_id: fin.finished ? fin.winner.user_id : null,
  });
}
