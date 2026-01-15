// deno-lint-ignore-file no-explicit-any

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as jose from "https://esm.sh/jose@5.9.6?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CDP_API_KEY_ID = Deno.env.get("CDP_API_KEY_ID") ?? "";
const CDP_API_KEY_SECRET = Deno.env.get("CDP_API_KEY_SECRET") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const CDP_HOST = "api.developer.coinbase.com";
const CONFIG_PATH = "/onramp/v1/buy/config";
const OPTIONS_PATH = "/onramp/v1/buy/options";

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

async function generateCdpJwt(method: string, path: string) {
  const now = Math.floor(Date.now() / 1000);
  const uri = `${method.toUpperCase()} ${CDP_HOST}${path}`;
  const key = await importEd25519PrivateKeyFromBase64(CDP_API_KEY_SECRET);

  const payload = {
    iss: "cdp",
    sub: CDP_API_KEY_ID,
    nbf: now,
    exp: now + 120,
    uri,
  };

  return await new jose.SignJWT(payload)
    .setProtectedHeader({
      alg: "EdDSA",
      kid: CDP_API_KEY_ID,
      nonce: randomHex(16),
      typ: "JWT",
    })
    .sign(key);
}

async function fetchCdpConfig() {
  const jwt = await generateCdpJwt("GET", CONFIG_PATH);
  const resp = await fetch(`https://${CDP_HOST}${CONFIG_PATH}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${jwt}` },
  });
  
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`CDP config error: ${resp.status} - ${text}`);
  }
  
  return await resp.json();
}

async function fetchCdpOptions(country: string, subdivision?: string) {
  const qs = new URLSearchParams({ country });
  if (subdivision) qs.append("subdivision", subdivision);
  
  const pathWithQuery = `${OPTIONS_PATH}?${qs}`;
  const jwt = await generateCdpJwt("GET", pathWithQuery);
  
  const resp = await fetch(`https://${CDP_HOST}${pathWithQuery}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${jwt}` },
  });
  
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`CDP options error: ${resp.status} - ${text}`);
  }
  
  return await resp.json();
}

function getSupabaseAdmin() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (!CDP_API_KEY_ID || !CDP_API_KEY_SECRET) {
      return json(500, { error: "Missing CDP_API_KEY_ID / CDP_API_KEY_SECRET" });
    }

    const url = new URL(req.url);
    const country = url.searchParams.get("country");
    const subdivision = url.searchParams.get("subdivision") || undefined;
    const action = url.searchParams.get("action");

    // POST ?action=sync → Sync all countries from CDP to database
    if (req.method === "POST" && action === "sync") {
      console.log("[cdp-countries] Starting sync...");
      
      const config = await fetchCdpConfig();
      console.log("[cdp-countries] Fetched config:", JSON.stringify(config).slice(0, 200));
      
      const countries = config?.countries || [];
      const supabase = getSupabaseAdmin();
      let synced = 0;
      
      for (const c of countries) {
        try {
          // Fetch options for each country
          const options = await fetchCdpOptions(c.id);
          
          const { error } = await supabase
            .from("cdp_supported_countries")
            .upsert({
              country_code: c.id,
              country_name: c.name || c.id,
              fiat_currencies: options?.fiatCurrencies || [],
              payment_methods: options?.paymentMethods || c.paymentMethods || [],
              purchase_limits: options?.purchaseLimits || null,
              subdivisions: c.subdivisions || null,
              is_active: true,
              last_synced_at: new Date().toISOString(),
            }, { onConflict: "country_code" });
          
          if (error) {
            console.error(`[cdp-countries] Upsert error for ${c.id}:`, error);
          } else {
            synced++;
          }
        } catch (err) {
          console.error(`[cdp-countries] Error fetching options for ${c.id}:`, err);
        }
      }
      
      console.log(`[cdp-countries] Sync complete: ${synced}/${countries.length}`);
      return json(200, { synced, total: countries.length });
    }

    // GET without country → Return all countries from database
    if (req.method === "GET" && !country) {
      console.log("[cdp-countries] Fetching all countries from DB");
      
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from("cdp_supported_countries")
        .select("*")
        .eq("is_active", true)
        .order("country_name");
      
      if (error) {
        console.error("[cdp-countries] DB error:", error);
        return json(500, { error: "Database error", details: error.message });
      }
      
      return json(200, { countries: data || [] });
    }

    // GET with country → Fetch options from CDP API directly
    if (req.method === "GET" && country) {
      console.log(`[cdp-countries] Fetching options for ${country}`);
      
      const options = await fetchCdpOptions(country, subdivision);
      return json(200, options);
    }

    return json(405, { error: "Method not allowed" });
  } catch (e: any) {
    console.error("[cdp-countries] Error:", e);
    return json(500, { error: e?.message ?? String(e) });
  }
});
