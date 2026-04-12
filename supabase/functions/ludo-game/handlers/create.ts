import { jsonOk, LudoHandledError } from "../lib/http.ts";

function toNum(x: any): number | null {
  if (x === null || x === undefined) return null;
  const n = typeof x === "string" ? Number(x) : Number(x);
  return Number.isFinite(n) ? n : null;
}

export async function handleCreate(body: any, supabase: any, user: any) {
  const betAmountRaw = body?.betAmount ?? body?.bet_amount ?? null; // null => free
  const maxPlayersRaw = body?.maxPlayers ?? body?.max_players ?? 4;
  const isPrivateRaw = body?.isPrivate ?? body?.is_private ?? false;

  const betNum = toNum(betAmountRaw); // null => free
  const betAmount = betNum === null ? 0 : betNum;
  if (betAmount < 0) throw new LudoHandledError("BAD_REQUEST", "betAmount must be >= 0");

  const maxPlayers = Number(maxPlayersRaw);
  if (!Number.isInteger(maxPlayers) || maxPlayers < 2 || maxPlayers > 4) {
    throw new LudoHandledError("BAD_REQUEST", "maxPlayers must be 2..4");
  }

  const isPrivate = Boolean(isPrivateRaw);
  const isFree = betNum === null || betAmount === 0;

  // 1) create game
  const { data: gameIns, error: gameErr } = await supabase
    .from("ludo_games")
    .insert({
      created_by: user.id,
      status: "created",
      bet_amount: betAmount, // numeric
      max_players: maxPlayers,
      is_public: !isPrivate,
      pot: 0, // ✅ jamais null
      turn_started_at: null, // ✅ évite timer en created
      dice: null,
      winner: null,
      winner_user_id: null,
      started_at: null,
      finished_at: null,
      claim_tx_hash: null,
      claim_status: null,
    })
    .select(
      "id,status,room_code,created_by,max_players,is_public,bet_amount,pot,created_at,turn_started_at,rev",
    )
    .limit(1);

  if (gameErr || !Array.isArray(gameIns) || !gameIns[0]) {
    throw new LudoHandledError("INTERNAL", "Failed to create game", { error: gameErr?.message });
  }

  const game = gameIns[0];

  // 2) insert creator as player (color R by convention)
  const desiredDepositStatus = isFree ? "free" : "pending";
  const desiredReady = isFree ? true : false;

  const { data: playerIns, error: playerErr } = await supabase
    .from("ludo_game_players")
    .insert({
      game_id: game.id,
      user_id: user.id,
      color: "R",
      is_ready: desiredReady,
      deposit_status: desiredDepositStatus, // ✅
      is_connected: true,
      has_exited: false,
    })
    .select("id,game_id,user_id,color,is_ready,deposit_status,turn_order,joined_at")
    .limit(1);

  if (playerErr || !Array.isArray(playerIns) || !playerIns[0]) {
    // rollback best effort
    await supabase.from("ludo_games").delete().eq("id", game.id);
    throw new LudoHandledError("INTERNAL", "Failed to create player for game", {
      error: playerErr?.message,
    });
  }

  let player = playerIns[0];

  // 3) ✅ Force post-insert fields (in case a trigger overwrote is_ready)
  if (isFree && (player.is_ready !== true || player.deposit_status !== "free")) {
    const { data: upd, error: updErr } = await supabase
      .from("ludo_game_players")
      .update({ is_ready: true, deposit_status: "free" })
      .eq("id", player.id)
      .select("id,game_id,user_id,color,is_ready,deposit_status,turn_order,joined_at")
      .limit(1);

    if (!updErr && Array.isArray(upd) && upd[0]) {
      player = upd[0];
    }
  }

  return jsonOk({
    ok: true,
    action: "created",
    game,
    player,
    autoReady: isFree,
    deposit_status: desiredDepositStatus,
  });
}
