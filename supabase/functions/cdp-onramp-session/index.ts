// deno-lint-ignore-file no-explicit-any

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { generateJwt } from "https://esm.sh/@coinbase/cdp-sdk@1.40.1/auth?target=deno";

const CDP_API_KEY_ID = Deno.env.get("CDP_API_KEY_ID") ?? "";
const CDP_API_KEY_SECRET_RAW = Deno.env.get("CDP_API_KEY_SECRET") ?? "";
const CDP_API_KEY_SECRET = CDP_API_KEY_SECRET_RAW.includes("\\n")
  ? CDP_API_KEY_SECRET_RAW.replace(/\\n/g, "\n")
  : CDP_API_KEY_SECRET_RAW;

// CDP Onramp API configuration
const CDP_ONRAMP_HOST = "api.cdp.coinbase.com";
const CDP_ONRAMP_PATH = "/platform/v2/onramp/sessions";
const CDP_ONRAMP_METHOD = "POST";
const JWT_EXPIRES_IN = 300; // 5 minutes

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

interface OnrampSessionRequest {
  purchaseCurrency?: string;
  destinationNetwork?: string;
  destinationAddress: string;
  paymentAmount: string;
  paymentCurrency?: string;
  paymentMethod: string;
  country: string;
  subdivision?: string;
  redirectUrl?: string;
  partnerUserRef?: string;
  clientIp?: string;
}

// Extract client IP from request headers (Supabase/Cloudflare)
function getClientIp(req: Request, bodyIp?: string): string | undefined {
  // Priority: body.clientIp > CF-Connecting-IP > X-Forwarded-For > X-Real-IP
  if (bodyIp) return bodyIp;
  
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;
  
  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) return xForwardedFor.split(",")[0].trim();
  
  const xRealIp = req.headers.get("x-real-ip");
  if (xRealIp) return xRealIp;
  
  return undefined;
}

serve(async (req) => {
  try {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (req.method !== "POST") {
      return json(405, { error: "Method not allowed (use POST)" });
    }

    requireEnv();

    // Parse request body
    const body: OnrampSessionRequest = await req.json().catch(() => ({}));

    // Validate required fields
    if (!body.destinationAddress) {
      return json(400, { error: "destinationAddress is required" });
    }
    if (!body.paymentAmount) {
      return json(400, { error: "paymentAmount is required" });
    }
    if (!body.country) {
      return json(400, { error: "country is required" });
    }

    // Get client IP from headers or body
    const clientIp = getClientIp(req, body.clientIp);
    console.log(`[cdp-onramp-session] Creating session for ${body.destinationAddress}, clientIp: ${clientIp || 'unknown'}`);

    // Step 1: Generate JWT for the onramp sessions API
    console.log(`[cdp-onramp-session] Generating JWT for ${CDP_ONRAMP_METHOD} ${CDP_ONRAMP_HOST}${CDP_ONRAMP_PATH}`);

    const jwtToken = await generateJwt({
      apiKeyId: CDP_API_KEY_ID,
      apiKeySecret: CDP_API_KEY_SECRET,
      requestMethod: CDP_ONRAMP_METHOD,
      requestHost: CDP_ONRAMP_HOST,
      requestPath: CDP_ONRAMP_PATH,
      expiresIn: JWT_EXPIRES_IN,
    });

    console.log(`[cdp-onramp-session] JWT generated successfully`);

    // Step 2: Build the onramp session payload
    const onrampPayload: Record<string, unknown> = {
      purchaseCurrency: body.purchaseCurrency || "USDC",
      destinationNetwork: body.destinationNetwork || "base",
      destinationAddress: body.destinationAddress,
      paymentAmount: body.paymentAmount,
      paymentCurrency: body.paymentCurrency || "USD",
      paymentMethod: body.paymentMethod || "CARD",
      country: body.country,
      ...(body.subdivision && { subdivision: body.subdivision }),
      ...(body.redirectUrl && { redirectUrl: body.redirectUrl }),
      ...(body.partnerUserRef && { partnerUserRef: body.partnerUserRef }),
    };

    // Add clientIp if available (required by Coinbase for some regions)
    if (clientIp) {
      onrampPayload.clientIp = clientIp;
    }

    console.log(`[cdp-onramp-session] Calling CDP API with payload:`, JSON.stringify(onrampPayload));

    // Step 3: Call the Coinbase CDP Onramp API
    const cdpResponse = await fetch(`https://${CDP_ONRAMP_HOST}${CDP_ONRAMP_PATH}`, {
      method: CDP_ONRAMP_METHOD,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(onrampPayload),
    });

    const cdpData = await cdpResponse.json();

    if (!cdpResponse.ok) {
      console.error(`[cdp-onramp-session] CDP API error:`, cdpData);
      return json(cdpResponse.status, { 
        error: cdpData?.message || cdpData?.error || "CDP API error",
        details: cdpData,
      });
    }

    console.log(`[cdp-onramp-session] Session created successfully:`, cdpData);

    // Step 4: Format the response
    // The CDP API returns data like: { onramp_url, quote: { ... } }
    const response = {
      session: {
        onrampUrl: cdpData.onramp_url || cdpData.onrampUrl,
      },
      quote: {
        paymentTotal: cdpData.quote?.payment_total?.value || cdpData.quote?.paymentTotal || "0",
        paymentSubtotal: cdpData.quote?.payment_subtotal?.value || cdpData.quote?.paymentSubtotal || "0",
        paymentCurrency: cdpData.quote?.payment_currency || body.paymentCurrency || "USD",
        purchaseAmount: cdpData.quote?.purchase_amount?.value || cdpData.quote?.purchaseAmount || "0",
        purchaseCurrency: cdpData.quote?.purchase_currency || body.purchaseCurrency || "USDC",
        destinationNetwork: cdpData.quote?.destination_network || body.destinationNetwork || "base",
        fees: (cdpData.quote?.coinbase_fee ? [
          {
            type: "coinbase_fee",
            amount: cdpData.quote.coinbase_fee.value || "0",
            currency: cdpData.quote.coinbase_fee.currency || "USD",
          },
          ...(cdpData.quote?.network_fee ? [{
            type: "network_fee",
            amount: cdpData.quote.network_fee.value || "0",
            currency: cdpData.quote.network_fee.currency || "USD",
          }] : []),
        ] : cdpData.quote?.fees || []),
        exchangeRate: cdpData.quote?.exchange_rate?.value || cdpData.quote?.exchangeRate || "1",
      },
    };

    return json(200, response);
  } catch (e: any) {
    console.error(`[cdp-onramp-session] Error:`, e);
    return json(500, { error: e?.message ?? String(e) });
  }
});
