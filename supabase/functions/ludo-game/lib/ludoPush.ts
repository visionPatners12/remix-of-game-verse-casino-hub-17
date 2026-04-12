import { sendFcmToTokens } from "./fcm.ts";

export async function fetchActiveFcmTokensForUsers(
  supabase: any,
  userIds: string[],
): Promise<string[]> {
  const ids = [...new Set(userIds.filter(Boolean))];
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("fcm_tokens")
    .select("token")
    .in("user_id", ids)
    .eq("is_active", true);

  if (error) {
    console.warn("fetchActiveFcmTokensForUsers:", error.message);
    return [];
  }

  const tokens = (data ?? []).map((r: { token: string }) => r.token).filter(Boolean);
  return [...new Set(tokens)];
}

export async function pushToUsers(
  supabase: any,
  userIds: string[],
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<void> {
  try {
    const tokens = await fetchActiveFcmTokensForUsers(supabase, userIds);
    if (tokens.length === 0) return;
    await sendFcmToTokens(tokens, title, body, data);
  } catch (e) {
    console.warn("pushToUsers:", e);
  }
}

/** Fire-and-forget: never blocks game logic */
export function pushToUsersLater(
  supabase: any,
  userIds: string[],
  title: string,
  body: string,
  data?: Record<string, string>,
): void {
  void pushToUsers(supabase, userIds, title, body, data);
}
