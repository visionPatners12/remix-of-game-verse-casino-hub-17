import { jsonOk, LudoHandledError } from "../lib/http.ts";
import { fetchGame } from "../lib/db.ts";
import { pushToUsers } from "../lib/ludoPush.ts";

type Phase = "tx_submitted" | "chain_confirmed";

export async function handleNotifyDeposit(body: any, supabase: any, user: any) {
  const { gameId, phase } = body as { gameId?: string; phase?: Phase };
  if (!gameId) throw new LudoHandledError("BAD_REQUEST", "Game ID is required");

  const ph: Phase = phase === "chain_confirmed" ? "chain_confirmed" : "tx_submitted";

  const { data: me, error: meErr } = await supabase
    .from("ludo_game_players")
    .select("id,user_id,deposit_status,tx_hash,has_exited")
    .eq("game_id", gameId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (meErr || !me || me.has_exited) {
    throw new LudoHandledError("FORBIDDEN", "Not a player in this game");
  }

  if (!me.tx_hash) {
    throw new LudoHandledError("BAD_STATE", "No deposit transaction on record");
  }

  const game = await fetchGame(supabase, gameId);
  const room = game.room_code ? ` room ${game.room_code}` : "";

  const { data: others, error: oErr } = await supabase
    .from("ludo_game_players")
    .select("user_id")
    .eq("game_id", gameId)
    .eq("has_exited", false)
    .neq("user_id", user.id);

  if (oErr) throw new LudoHandledError("INTERNAL", "Failed to list players");

  const userIds = (others ?? []).map((r: { user_id: string }) => r.user_id).filter(Boolean);
  if (userIds.length === 0) {
    return jsonOk({ ok: true, action: "notify_deposit_skipped", reason: "no_other_players" });
  }

  const title = ph === "chain_confirmed" ? "Ludo: deposit confirmed" : "Ludo: deposit submitted";
  const msg =
    ph === "chain_confirmed"
      ? `A player’s deposit was confirmed on-chain${room}.`
      : `A player submitted a deposit (pending confirmation)${room}.`;

  await pushToUsers(supabase, userIds, title, msg, {
    type: "ludo_deposit",
    gameId,
    phase: ph,
  });

  return jsonOk({ ok: true, action: "notify_deposit_sent", phase: ph });
}
