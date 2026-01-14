// deno-lint-ignore-file no-explicit-any

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";
import { generateJwt } from "npm:@coinbase/cdp-sdk@1.40.1/auth";

// -------------------- Config --------------------
const SB_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SB_ANON = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

const CDP_API_KEY_ID = Deno.env.get("CDP_API_KEY_ID") ?? "";
const CDP_API_KEY_SECRET = Deno.env.get("CDP_API_KEY_SECRET") ?? "";

const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const IP_FORWARD_SECRET = Deno.env.get("IP_FORWARD_SECRET") ?? "";

const CDP_HOST = "api.developer.coinbase.com";
const CDP_PATH = "/onramp/v1/token";
const CDP_URL = `https://${CDP_HOST}${CDP_PATH}`;

// -------------------- CORS --------------------
function corsHeaders(origin: string | null) {
  if (!origin || ALLOWED_ORIGINS.length === 0) return {};
  if (!ALLOWED_ORIGINS.includes(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, content-type",
    "Vary": "Origin",
  };
}

function json(status: number, body: any, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

// -------------------- Types --------------------
type SessionTokenRequest = {
  addresses: Array<{ address: string; blockchains: string[] }>;
  assets?: string[];
};

// -------------------- Helpers --------------------
function bestEffortClientIp(req: Request): string | undefined {
  return (
    req.headers.get("cf-connecting-ip")?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    undefined
  );
}

function verifiedClientIp(req: Request): string | undefined {
  if (!IP_FORWARD_SECRET) return undefined;

  const secret = req.headers.get("x-ip-forward-secret")?.trim();
  if (!secret || secret !== IP_FORWARD_SECRET) return undefined;

  const ip = req.headers.get("x-client-ip-verified")?.trim();
  return ip || undefined;
}

async function requireSupabaseUser(req: Request) {
  if (!SB_URL || !SB_ANON) {
    const auth = req.headers.get("authorization") ?? "";
    if (!auth.startsWith("Bearer ")) throw new Error("Missing Authorization bearer token");
    return;
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const sb = createClient(SB_URL, SB_ANON, { global: { headers: { Authorization: authHeader } } });
  const { data, error } = await sb.auth.getUser();
  if (error || !data?.user) throw new Error("Unauthorized");
}

function validateBody(body: any): SessionTokenRequest {
  if (!body || typeof body !== "object") throw new Error("Invalid JSON body");

  const { addresses, assets } = body as SessionTokenRequest;
  if (!Array.isArray(addresses) || addresses.length === 0) {
    throw new Error("addresses[] is required");
  }
  for (const a of addresses) {
    if (!a?.address || typeof a.address !== "string") throw new Error("addresses[].address invalid");
    if (!Array.isArray(a.blockchains) || a.blockchains.length === 0) {
      throw new Error("addresses[].blockchains is required");
    }
  }
  if (assets !== undefined) {
    if (!Array.isArray(assets)) throw new Error("assets must be an array");
  }

  return { addresses, assets };
}

// -------------------- Handler --------------------
serve(async (req) => {
  const origin = req.headers.get("origin");
  const cors = corsHeaders(origin);

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" }, cors);

  try {
    if (!CDP_API_KEY_ID || !CDP_API_KEY_SECRET) {
      console.error("Missing CDP credentials");
      return json(500, { error: "Missing CDP_API_KEY_ID / CDP_API_KEY_SECRET" }, cors);
    }

    await requireSupabaseUser(req);

    const body = validateBody(await req.json());
    console.log("Generating session token for addresses:", body.addresses);

    const clientIp = verifiedClientIp(req) ?? bestEffortClientIp(req);

    const jwt = await generateJwt({
      apiKeyId: CDP_API_KEY_ID,
      apiKeySecret: CDP_API_KEY_SECRET,
      requestMethod: "POST",
      requestHost: CDP_HOST,
      requestPath: CDP_PATH,
      expiresIn: 120,
    });

    const payload: Record<string, any> = {
      addresses: body.addresses,
    };
    if (body.assets?.length) payload.assets = body.assets;
    if (clientIp) payload.clientIp = clientIp;

    console.log("Calling Coinbase token API...");
    const resp = await fetch(CDP_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await resp.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!resp.ok) {
      console.error("Coinbase API error:", resp.status, data);
      return json(resp.status, { error: "Coinbase token API error", details: data }, cors);
    }

    console.log("Session token generated successfully");
    return json(200, data, cors);
  } catch (e: any) {
    console.error("Error generating session token:", e?.message ?? String(e));
    return json(400, { error: e?.message ?? String(e) }, cors);
  }
});
