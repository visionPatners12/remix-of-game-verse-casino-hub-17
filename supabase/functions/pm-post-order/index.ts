import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache partagé avec pm-derive (en prod, utiliser Deno KV)
const cache = new Map<string, { key: string; passphrase: string; secret: string; exp: number }>();

interface PostOrderRequest {
  address: string;
  ownerApiKey: string;
  orderType: "GTC" | "FOK" | "GTD";
  order: any;
}

async function hmacHex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(sigBuf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { 
      status: 405,
      headers: corsHeaders 
    });
  }

  try {
    const { address, ownerApiKey, orderType, order }: PostOrderRequest = await req.json();

    console.log('📝 Polymarket post order request:', { address, orderType });

    if (!address || !ownerApiKey || !orderType || !order) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check credentials in cache
    const creds = cache.get(address?.toLowerCase());
    if (!creds || creds.exp <= Date.now()) {
      console.error('❌ No L2 credentials found or expired for address:', address);
      return new Response(JSON.stringify({ error: "No L2 creds. Derive first." }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (creds.key !== ownerApiKey) {
      console.error('❌ API key mismatch for address:', address);
      return new Response(JSON.stringify({ error: "ownerApiKey mismatch" }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('🔐 Signing order with HMAC...');

    const endpoint = "/order";
    const ts = String(Math.floor(Date.now() / 1000));
    const bodyObj = { owner: creds.key, orderType, order };
    const body = JSON.stringify(bodyObj);
    
    // HMAC signature: ts + method + endpoint + body
    const sig = await hmacHex(creds.secret, `${ts}POST${endpoint}${body}`);

    console.log('🌐 Posting order to Polymarket CLOB...');

    const response = await fetch(`https://clob.polymarket.com${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "POLY_ADDRESS": address,
        "POLY_API_KEY": creds.key,
        "POLY_PASSPHRASE": creds.passphrase,
        "POLY_TIMESTAMP": ts,
        "POLY_SIGNATURE": sig,
      },
      body,
    });

    const responseText = await response.text();
    
    if (response.ok) {
      console.log('✅ Order posted successfully');
    } else {
      console.error('❌ Order posting failed:', response.status, responseText);
    }

    return new Response(responseText, { 
      status: response.status, 
      headers: { ...corsHeaders, "content-type": "application/json" } 
    });

  } catch (error: unknown) {
    console.error('❌ Error in pm-post-order function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});