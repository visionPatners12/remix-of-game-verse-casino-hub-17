import type { Color } from "../ludoLogic.ts";

export type PlayerRow = {
  user_id: string;
  color: Color;
  turn_order: number | null;
  has_exited: boolean | null;
  position: number | null;
};

export function activePlayers(players: PlayerRow[]) {
  return players
    .filter((p) => (p.has_exited ?? false) === false && p.position == null)
    .sort((a, b) => (a.turn_order ?? 999) - (b.turn_order ?? 999));
}

export function remainingPositions(players: PlayerRow[]) {
  const n = players.length;
  const used = new Set<number>();
  for (const p of players) if (p.position != null) used.add(Number(p.position));

  const remaining: number[] = [];
  for (let i = 1; i <= n; i++) if (!used.has(i)) remaining.push(i);
  remaining.sort((a, b) => a - b);
  return remaining;
}

// ✅ FINISH = plus petite position dispo (1,2,...)
export function pickFinishRank(players: PlayerRow[]) {
  const rem = remainingPositions(players);
  return rem.length ? rem[0] : null;
}

// ✅ EXIT = dernière position dispo (4,3,...)
export function pickExitRank(players: PlayerRow[]) {
  const rem = remainingPositions(players);
  return rem.length ? rem[rem.length - 1] : null;
}

export function winnerByRank1(players: PlayerRow[]) {
  return players.find((p) => (p.has_exited ?? false) === false && Number(p.position) === 1) ?? null;
}

export function pickNextTurnColor(active: PlayerRow[], currentTurn: Color): Color | null {
  if (!active.length) return null;
  const idx = active.findIndex((p) => p.color === currentTurn);
  if (idx === -1) return active[0].color;
  return active[(idx + 1) % active.length].color;
}
