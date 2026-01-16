// deno-lint-ignore-file no-explicit-any

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { generateJwt } from "https://esm.sh/@coinbase/cdp-sdk@1.40.1/auth?target=deno";

const CDP_API_KEY_ID = Deno.env.get("CDP_API_KEY_ID") ?? "";
const CDP_API_KEY_SECRET_RAW = Deno.env.get("CDP_API_KEY_SECRET") ?? "";
const CDP_API_KEY_SECRET = CDP_API_KEY_SECRET_RAW.includes("\\n")
  ? CDP_API_KEY_SECRET_RAW.replace(/\\n/g, "\n")
  : CDP_API_KEY_SECRET_RAW;

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
};

function json(status: number, body: any) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function requireEnv() {
  if (!CDP_API_KEY_ID || !CDP_API_KEY_SECRET) {
    throw new Error("Missing CDP_API_KEY_ID / CDP_API_KEY_SECRET");
  }
}

function normalizeMethod(m?: string | null) {
  const method = (m ?? "GET").trim().toUpperCase();
  if (!["GET", "POST", "PUT", "DELETE", "PATCH"].includes(method)) {
    throw new Error("Invalid requestMethod");
  }
  return method;
}

function normalizeHost(h?: string | null) {
  const host = (h ?? "").trim();
  if (!host) throw new Error("requestHost is required");
  if (host.includes("://") || host.includes("/") || host.includes("?")) {
    throw new Error("requestHost must be hostname only (e.g. api.cdp.coinbase.com)");
  }
  return host;
}

function normalizePath(p?: string | null) {
  const path = (p ?? "").trim();
  if (!path) throw new Error("requestPath is required");
  if (!path.startsWith("/")) throw new Error("requestPath must start with '/'");
  // IMPORTANT: must NOT include query string for JWT signing
  if (path.includes("?")) throw new Error("requestPath must NOT include query string");
  return path;
}

serve(async (req) => {
  try {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (req.method !== "GET" && req.method !== "POST") {
      return json(405, { error: "Method not allowed (use GET or POST)" });
    }

    requireEnv();

    let requestHost = "";
    let requestPath = "";
    let requestMethod = "GET";
    let expiresIn = 120;

    if (req.method === "GET") {
      const url = new URL(req.url);
      requestHost = normalizeHost(url.searchParams.get("requestHost"));
      requestPath = normalizePath(url.searchParams.get("requestPath"));
      requestMethod = normalizeMethod(url.searchParams.get("requestMethod"));
      const exp = url.searchParams.get("expiresIn");
      if (exp) expiresIn = Math.max(30, Math.min(600, Number(exp) || 120));
    } else {
      const body = await req.json().catch(() => ({}));
      requestHost = normalizeHost(body.requestHost);
      requestPath = normalizePath(body.requestPath);
      requestMethod = normalizeMethod(body.requestMethod);
      if (body.expiresIn !== undefined) {
        const n = Number(body.expiresIn);
        expiresIn = Math.max(30, Math.min(600, Number.isFinite(n) ? n : 120));
      }
    }

    console.log(`[cdp-session-token] Generating JWT for ${requestMethod} ${requestHost}${requestPath}`);

    const token = await generateJwt({
      apiKeyId: CDP_API_KEY_ID,
      apiKeySecret: CDP_API_KEY_SECRET,
      requestMethod,
      requestHost,
      requestPath,
      expiresIn,
    });

    console.log(`[cdp-session-token] JWT generated successfully, expires in ${expiresIn}s`);

    return json(200, {
      token,
      requestHost,
      requestPath,
      requestMethod,
      expiresIn,
    });
  } catch (e: any) {
    console.error(`[cdp-session-token] Error:`, e);
    return json(400, { error: e?.message ?? String(e) });
  }
});
