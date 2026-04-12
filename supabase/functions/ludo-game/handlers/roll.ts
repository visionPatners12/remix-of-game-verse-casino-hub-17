import { jsonOk, LudoHandledError } from "../lib/http.ts";
import { rollDiceCrypto, nowIso } from "../lib/config.ts";
import { withRetryOnOptimistic, updateGameOptimistic } from "../lib/optimistic.ts";
import { fetchGame, fetchMePlayer } from "../lib/db.ts";

export async function handleRoll(body: any, supabase: any, user: any) {
  const { gameId } = body;
  if (!gameId) throw new LudoHandledError("BAD_REQUEST", "Game ID is required");

  const game = await fetchGame(supabase, gameId);
  if (game.status !== "active") throw new LudoHandledError("BAD_STATE", "Game is not active");
  if (game.dice !== null && game.dice !== undefined) {
    throw new LudoHandledError("BAD_STATE", "You must play your move before rolling again");
  }

  const me = await fetchMePlayer(supabase, gameId, user.id);
  if (me.has_exited) throw new LudoHandledError("FORBIDDEN", "You exited");
  if (me.position != null) throw new LudoHandledError("FORBIDDEN", "You already finished");
  if (me.color !== game.turn) throw new LudoHandledError("FORBIDDEN", "Not your turn");

  const diceValue = rollDiceCrypto();

  await withRetryOnOptimistic(() =>
    updateGameOptimistic(
      supabase,
      gameId,
      { rev: game.rev ?? 0, turn: game.turn, diceMustBeNull: true },
      { dice: diceValue, turn_started_at: nowIso() }, // refresh
      "id,rev,turn,dice,turn_started_at",
    ),
  );

  return jsonOk({
    ok: true,
    diceValue,
  });
}
