
import * as jose from "https://esm.sh/jose@5.9.6?target=deno";

type ServiceAccount = {
  client_email: string;
  private_key: string;
  project_id: string;
};

let cachedSa: ServiceAccount | null = null;
let accessToken: { token: string; exp: number } | null = null;

function getServiceAccount(): ServiceAccount | null {
  const raw = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON")?.trim();
  if (!raw) return null;
  if (cachedSa) return cachedSa;
  try {
    const parsed = JSON.parse(raw) as ServiceAccount;
    if (!parsed?.client_email || !parsed?.private_key || !parsed?.project_id) return null;
    cachedSa = {
      ...parsed,
      private_key: parsed.private_key.replace(/\\n/g, "\n"),
    };
    return cachedSa;
  } catch {
    return null;
  }
}

async function getGoogleAccessToken(): Promise<string | null> {
  const sa = getServiceAccount();
  if (!sa) return null;

  const now = Math.floor(Date.now() / 1000);
  if (accessToken && accessToken.exp > now + 60) return accessToken.token;

  const key = await jose.importPKCS8(sa.private_key, "RS256");
  const jwt = await new jose.SignJWT({
    scope: "https://www.googleapis.com/auth/firebase.messaging",
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(sa.client_email)
    .setSubject(sa.client_email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(key);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    console.error("FCM oauth failed:", await res.text());
    return null;
  }

  const json = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!json.access_token) return null;
  accessToken = {
    token: json.access_token,
    exp: now + (json.expires_in ?? 3600),
  };
  return accessToken.token;
}

export async function sendFcmToTokens(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<void> {
  const sa = getServiceAccount();
  if (!sa || tokens.length === 0) return;

  const token = await getGoogleAccessToken();
  if (!token) return;

  const url = `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`;
  const unique = [...new Set(tokens.filter(Boolean))];

  await Promise.allSettled(
    unique.map(async (deviceToken) => {
      const message: Record<string, unknown> = {
        token: deviceToken,
        notification: { title, body },
      };
      if (data && Object.keys(data).length > 0) {
        (message as { data: Record<string, string> }).data = data;
      }

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        const t = await res.text();
        console.warn("FCM send failed for token:", deviceToken.slice(0, 12) + "…", res.status, t);
      }
    }),
  );
}
