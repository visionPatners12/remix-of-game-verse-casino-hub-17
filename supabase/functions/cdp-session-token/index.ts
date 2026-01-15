// deno-lint-ignore-file no-explicit-any

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as jose from "https://esm.sh/jose@5.9.6?target=deno";

const CDP_API_KEY_ID = Deno.env.get("CDP_API_KEY_ID") ?? "";
const CDP_API_KEY_SECRET = Deno.env.get("CDP_API_KEY_SECRET") ?? "";

// API v1 for session tokens
const CDP_HOST = "api.developer.coinbase.com";
const CDP_PATH = "/onramp/v1/token";
const CDP_URL = `https://${CDP_HOST}${CDP_PATH}`;

// API v2 for Apple Pay orders
const CDP_HOST_V2 = "api.cdp.coinbase.com";
const CDP_ORDERS_PATH = "/platform/v2/onramp/orders";
const CDP_ORDERS_URL = `https://${CDP_HOST_V2}${CDP_ORDERS_PATH}`;

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
};

type SessionTokenRequest = {
  addresses: Array<{ address: string; blockchains: string[] }>;
  assets?: string[];
  clientIp?: string;
};

type ApplePayOrderRequest = {
  destinationAddress: string;
  email: string;
  phoneNumber: string;
  paymentAmount: string;
  partnerUserRef?: string;
  partnerOrderRef?: string;
};

type EdgeFunctionRequest = {
  endpoint: "token" | "apple-pay-order";
  body: SessionTokenRequest | ApplePayOrderRequest;
};

function json(status: number, body: any) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function randomHex(bytes = 16) {
  const b = new Uint8Array(bytes);
  crypto.getRandomValues(b);
  return Array.from(b).map((x) => x.toString(16).padStart(2, "0")).join("");
}

function base64ToBytes(b64: string) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function bytesToBase64Url(bytes: Uint8Array) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  const b64 = btoa(bin);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function importEd25519PrivateKeyFromBase64(secretB64: string) {
  const raw = base64ToBytes(secretB64.trim());
  const d = bytesToBase64Url(raw);

  const jwk = { kty: "OKP", crv: "Ed25519", d };
  return await jose.importJWK(jwk as any, "EdDSA");
}

async function generateCdpJwtEd25519(opts: {
  keyId: string;
  keySecretB64: string;
  method: string;
  host: string;
  path: string;
  ttlSeconds?: number;
}) {
  const now = Math.floor(Date.now() / 1000);
  const ttl = opts.ttlSeconds ?? 120;

  const uri = `${opts.method.toUpperCase()} ${opts.host}${opts.path}`;

  const key = await importEd25519PrivateKeyFromBase64(opts.keySecretB64);

  const payload = {
    iss: "cdp",
    sub: opts.keyId,
    nbf: now,
    exp: now + ttl,
    uri,
  };

  return await new jose.SignJWT(payload)
    .setProtectedHeader({
      alg: "EdDSA",
      kid: opts.keyId,
      nonce: randomHex(16),
      typ: "JWT",
    })
    .sign(key);
}

function validateSessionTokenBody(b: any): SessionTokenRequest {
  if (!b || typeof b !== "object") throw new Error("Invalid JSON body");
  if (!Array.isArray(b.addresses) || b.addresses.length === 0) {
    throw new Error("addresses[] is required");
  }
  for (const a of b.addresses) {
    if (!a?.address || typeof a.address !== "string") throw new Error("addresses[].address invalid");
    if (!Array.isArray(a.blockchains) || a.blockchains.length === 0) {
      throw new Error("addresses[].blockchains required");
    }
  }
  if (b.assets !== undefined && !Array.isArray(b.assets)) throw new Error("assets must be array");
  if (b.clientIp !== undefined && typeof b.clientIp !== "string") throw new Error("clientIp must be string");
  return b as SessionTokenRequest;
}

function validateApplePayBody(b: any): ApplePayOrderRequest {
  if (!b || typeof b !== "object") throw new Error("Invalid JSON body for Apple Pay order");
  if (!b.destinationAddress || typeof b.destinationAddress !== "string") {
    throw new Error("destinationAddress is required");
  }
  if (!b.email || typeof b.email !== "string") {
    throw new Error("email is required");
  }
  if (!b.phoneNumber || typeof b.phoneNumber !== "string") {
    throw new Error("phoneNumber is required");
  }
  if (!b.paymentAmount || typeof b.paymentAmount !== "string") {
    throw new Error("paymentAmount is required");
  }
  return b as ApplePayOrderRequest;
}

function validateEdgeFunctionRequest(raw: any): EdgeFunctionRequest {
  if (!raw || typeof raw !== "object") throw new Error("Invalid JSON body");
  
  // Support new format (endpoint + body)
  if (raw.endpoint && raw.body) {
    if (raw.endpoint === "token") {
      return {
        endpoint: "token",
        body: validateSessionTokenBody(raw.body),
      };
    }
    if (raw.endpoint === "apple-pay-order") {
      return {
        endpoint: "apple-pay-order",
        body: validateApplePayBody(raw.body),
      };
    }
    throw new Error(`Unknown endpoint: ${raw.endpoint}`);
  }
  
  // Legacy format: direct addresses in the root
  return {
    endpoint: "token",
    body: validateSessionTokenBody(raw),
  };
}

async function handleSessionToken(body: SessionTokenRequest) {
  const jwt = await generateCdpJwtEd25519({
    keyId: CDP_API_KEY_ID,
    keySecretB64: CDP_API_KEY_SECRET,
    method: "POST",
    host: CDP_HOST,
    path: CDP_PATH,
    ttlSeconds: 120,
  });

  const resp = await fetch(CDP_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      addresses: body.addresses,
      assets: body.assets,
      clientIp: body.clientIp,
    }),
  });

  const text = await resp.text();
  let data: any;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  if (!resp.ok) {
    return json(resp.status, { error: "Coinbase error", details: data });
  }

  return json(200, data);
}

async function handleApplePayOrder(body: ApplePayOrderRequest) {
  console.log(`[cdp-session-token] Creating Apple Pay order for ${body.destinationAddress}`);
  
  const jwt = await generateCdpJwtEd25519({
    keyId: CDP_API_KEY_ID,
    keySecretB64: CDP_API_KEY_SECRET,
    method: "POST",
    host: CDP_HOST_V2,
    path: CDP_ORDERS_PATH,
    ttlSeconds: 120,
  });

  const now = new Date().toISOString();
  const orderPayload = {
    agreementAcceptedAt: now,
    destinationAddress: body.destinationAddress,
    destinationNetwork: "base",
    email: body.email,
    phoneNumber: body.phoneNumber,
    phoneNumberVerifiedAt: now,
    paymentMethod: "GUEST_CHECKOUT_APPLE_PAY",
    paymentCurrency: "USD",
    purchaseCurrency: "USDC",
    paymentAmount: body.paymentAmount,
    partnerUserRef: body.partnerUserRef || undefined,
    partnerOrderRef: body.partnerOrderRef || `order-${randomHex(8)}`,
    domain: "pay.coinbase.com",
    isQuote: false,
  };

  console.log(`[cdp-session-token] Apple Pay order payload:`, JSON.stringify(orderPayload));

  const resp = await fetch(CDP_ORDERS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderPayload),
  });

  const text = await resp.text();
  let data: any;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  console.log(`[cdp-session-token] Apple Pay order response status: ${resp.status}`);
  console.log(`[cdp-session-token] Apple Pay order response:`, JSON.stringify(data));

  if (!resp.ok) {
    return json(resp.status, { error: "Coinbase Apple Pay error", details: data });
  }

  return json(200, data);
}

serve(async (req) => {
  try {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
    if (req.method !== "POST") return json(405, { error: "Method not allowed" });

    if (!CDP_API_KEY_ID || !CDP_API_KEY_SECRET) {
      return json(500, { error: "Missing CDP_API_KEY_ID / CDP_API_KEY_SECRET" });
    }

    const request = validateEdgeFunctionRequest(await req.json());
    
    console.log(`[cdp-session-token] Processing endpoint: ${request.endpoint}`);

    if (request.endpoint === "token") {
      return await handleSessionToken(request.body as SessionTokenRequest);
    }

    if (request.endpoint === "apple-pay-order") {
      return await handleApplePayOrder(request.body as ApplePayOrderRequest);
    }

    return json(400, { error: "Unknown endpoint" });
  } catch (e: any) {
    console.error(`[cdp-session-token] Error:`, e);
    return json(400, { error: e?.message ?? String(e) });
  }
});
