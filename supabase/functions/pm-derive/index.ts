import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple cache en mémoire (remplace par Deno KV en prod)
const cache = new Map<string, { key: string; passphrase: string; secret: string; exp: number }>();

interface ClobAuthRequest {
  address: string;
  timestamp: string;
  nonce: number;
  signature: string;
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
    const { address, timestamp, nonce, signature }: ClobAuthRequest = await req.json();

    console.log('🔑 Polymarket derive request:', { address, timestamp, nonce });

    if (!address || !timestamp || !signature) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check cache (TTL 1h)
    const hit = cache.get(address?.toLowerCase());
    if (hit && hit.exp > Date.now()) {
      console.log('📝 Cache hit for address:', address);
      return new Response(JSON.stringify({ key: hit.key, passphrase: hit.passphrase }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('🌐 Making derive request to Polymarket CLOB...');

    // Derive API key (L1 headers)
    const response = await fetch("https://clob.polymarket.com/auth/derive-api-key", {
      method: "GET",
      headers: {
        "POLY_ADDRESS": address,
        "POLY_SIGNATURE": signature,
        "POLY_TIMESTAMP": String(timestamp),
        "POLY_NONCE": String(nonce ?? 0),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Polymarket derive failed:', response.status, errorText);
      return new Response(errorText, { 
        status: response.status,
        headers: corsHeaders 
      });
    }

    const { key, secret, passphrase } = await response.json();
    console.log('✅ Polymarket derive successful, caching credentials');

    // Cache for 1 hour
    cache.set(address.toLowerCase(), { 
      key, 
      secret, 
      passphrase, 
      exp: Date.now() + 60 * 60 * 1000 
    });

    // Return only key and passphrase (never secret)
    return new Response(JSON.stringify({ key, passphrase }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('❌ Error in pm-derive function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});