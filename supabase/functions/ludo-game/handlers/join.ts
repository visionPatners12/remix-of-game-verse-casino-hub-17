import { jsonOk, LudoHandledError } from "../lib/http.ts";
import { fetchGame } from "../lib/db.ts";
import { pushToUsersLater } from "../lib/ludoPush.ts";

async function notifyOthersPlayerJoined(
  supabase: any,
  gameId: string,
  joinedUserId: string,
  roomCode: string | null | undefined,
) {
  const { data } = await supabase
    .from("ludo_game_players")
    .select("user_id")
    .eq("game_id", gameId)
    .eq("has_exited", false);
  const ids = (data ?? [])
    .map((r: { user_id: string }) => r.user_id)
    .filter((id: string) => id && id !== joinedUserId);
  if (ids.length === 0) return;
  const rc = roomCode ? ` (${roomCode})` : "";
  pushToUsersLater(
    supabase,
    ids,
    "Ludo: player joined",
    `Someone joined your game${rc}.`,
    { type: "ludo_join", gameId },
  );
}

const COLORS = ["R", "G", "Y", "B"] as const;

function isUniqueViolation(err: any): boolean {
  return err?.code === "23505";
}

function toNumOrNull(x: any): number | null {
  if (x === null || x === undefined) return null;
  const n = typeof x === "string" ? Number(x) : Number(x);
  return Number.isFinite(n) ? n : null;
}

async function fetchMyPlayer(supabase: any, gameId: string, userId: string) {
  const { data } = await supabase
    .from("ludo_game_players")
    .select("id,game_id,user_id,color,is_ready,deposit_status,turn_order,joined_at")
    .eq("game_id", gameId)
    .eq("user_id", userId)
    .maybeSingle();
  return data ?? null;
}

export async function handleJoin(body: any, supabase: any, user: any) {
  const { gameId } = body;
  if (!gameId) throw new LudoHandledError("BAD_REQUEST", "Game ID is required");

  // ✅ 1) IDÉMPOTENCE D’ABORD : si déjà joueur => OK (peu importe status)
  const already = await fetchMyPlayer(supabase, gameId, user.id);
  if (already) {
    // on renvoie aussi le status actuel pour que le front sache où aller
    const g = await fetchGame(supabase, gameId);
    return jsonOk({ ok: true, action: "already_joined", player: already, game_status: g.status });
  }

  // ✅ 2) Ensuite seulement on vérifie la game
  const game = await fetchGame(supabase, gameId);

  if (game.status !== "created") {
    throw new LudoHandledError("BAD_STATE", "You can only join a game in 'created' status", {
      status: game.status,
    });
  }

  const betNum = toNumOrNull(game?.bet_amount);
  const isFree = betNum === null || betNum === 0;

  const desiredDepositStatus = isFree ? "free" : "pending";
  const desiredReady = isFree ? true : false;

  // lire couleurs prises
  const { data: players, error: playersErr } = await supabase
    .from("ludo_game_players")
    .select("color")
    .eq("game_id", gameId);

  if (playersErr) throw new LudoHandledError("INTERNAL", "Failed to read players");

  const current = players?.length ?? 0;
  const max = game.max_players ?? 4;
  if (current >= max) throw new LudoHandledError("BAD_STATE", "Game is full", { current, max });

  const taken = new Set<string>((players ?? []).map((p: any) => p.color));
  const available = COLORS.filter((c) => !taken.has(c));
  if (!available.length) throw new LudoHandledError("BAD_STATE", "No colors available");

  // ✅ 3) Retry loop race-condition safe
  for (let attempt = 0; attempt < 6; attempt++) {
    const color = available[Math.min(attempt, available.length - 1)];

    const { data: ins, error: insErr } = await supabase
      .from("ludo_game_players")
      .insert({
        game_id: gameId,
        user_id: user.id,
        color,
        is_ready: desiredReady,
        deposit_status: desiredDepositStatus,
        is_connected: true,
        has_exited: false,
      })
      .select("id,game_id,user_id,color,is_ready,deposit_status,turn_order,joined_at")
      .limit(1);

    if (!insErr) {
      let player = Array.isArray(ins) ? ins[0] : ins;
      if (!player) {
        // ultra rare: insert ok mais data vide -> on relit
        player = await fetchMyPlayer(supabase, gameId, user.id);
      }

      if (!player) throw new LudoHandledError("INTERNAL", "Join succeeded but player not found");

      // ✅ si gratuit, on force post-insert (si un trigger écrase)
      if (isFree && (player.is_ready !== true || player.deposit_status !== "free")) {
        const { data: upd } = await supabase
          .from("ludo_game_players")
          .update({ is_ready: true, deposit_status: "free" })
          .eq("id", player.id)
          .select("id,game_id,user_id,color,is_ready,deposit_status,turn_order,joined_at")
          .limit(1);

        if (Array.isArray(upd) && upd[0]) player = upd[0];
      }

      notifyOthersPlayerJoined(supabase, gameId, user.id, game.room_code);
      return jsonOk({ ok: true, action: "joined", player, autoReady: isFree });
    }

    // ✅ si unique violation, on RECHECK si on est déjà inséré (ou si un autre call a gagné)
    if (isUniqueViolation(insErr)) {
      const mine = await fetchMyPlayer(supabase, gameId, user.id);
      if (mine) {
        return jsonOk({ ok: true, action: "joined", player: mine, autoReady: isFree, note: "idempotent_recover" });
      }
      continue;
    }

    throw new LudoHandledError("INTERNAL", "Failed to join", { error: insErr?.message });
  }

  // ✅ avant de renvoyer CONFLICT, on refait une dernière lecture : si présent => succès
  const mine = await fetchMyPlayer(supabase, gameId, user.id);
  if (mine) {
    return jsonOk({ ok: true, action: "joined", player: mine, note: "final_recover" });
  }

  throw new LudoHandledError("CONFLICT", "Couldn't join due to concurrent joins, retry");
}
