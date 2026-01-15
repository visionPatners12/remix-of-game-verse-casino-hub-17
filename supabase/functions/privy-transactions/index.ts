import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRIVY_APP_ID = Deno.env.get("PRIVY_APP_ID") ?? "";
const PRIVY_APP_SECRET = Deno.env.get("PRIVY_APP_SECRET") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1) Validate user via Supabase JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Auth error:", authError?.message);
      throw new Error("Unauthorized");
    }

    // 2) Get request parameters
    const { wallet_id, chain = "base", asset = "usdc", limit = 50 } = await req.json();
    
    if (!wallet_id) {
      throw new Error("wallet_id is required");
    }

    console.log(`📡 Fetching transactions for wallet ${wallet_id} on ${chain}, asset ${asset}`);

    // 3) Call Privy API with Basic Auth (app-id:app-secret)
    const basicAuth = btoa(`${PRIVY_APP_ID}:${PRIVY_APP_SECRET}`);
    const url = `https://api.privy.io/v1/wallets/${wallet_id}/transactions?chain=${chain}&asset=${asset}&limit=${limit}`;
    
    const privyResponse = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Basic ${basicAuth}`,
        "privy-app-id": PRIVY_APP_ID,
        "Content-Type": "application/json",
      },
    });

    if (!privyResponse.ok) {
      const errorText = await privyResponse.text();
      console.error("❌ Privy API error:", privyResponse.status, errorText);
      throw new Error(`Privy API error: ${privyResponse.status} - ${errorText}`);
    }

    const privyData = await privyResponse.json();
    console.log(`✅ Got ${privyData.transactions?.length || 0} transactions from Privy`);

    // 4) Upsert transactions into cache table
    if (privyData.transactions?.length > 0) {
      const records = privyData.transactions.map((tx: any) => ({
        user_id: user.id,
        wallet_id,
        chain: tx.details?.chain || chain,
        asset: tx.details?.asset || asset,
        transaction_hash: tx.transaction_hash,
        privy_transaction_id: tx.privy_transaction_id || null,
        status: tx.status,
        type: tx.details?.type || null,
        sender: tx.details?.sender || null,
        recipient: tx.details?.recipient || null,
        raw_value: tx.details?.raw_value || null,
        raw_value_decimals: tx.details?.raw_value_decimals || null,
        display_value: tx.details?.display_values?.[asset] || null,
        caip2: tx.caip2 || null,
        privy_created_at: tx.created_at || null,
        updated_at: new Date().toISOString(),
      }));

      const { error: upsertError } = await supabase
        .from("privy_transactions")
        .upsert(records, { onConflict: "transaction_hash,chain" });

      if (upsertError) {
        console.error("⚠️ Upsert error:", upsertError.message);
      } else {
        console.log(`💾 Cached ${records.length} transactions`);
      }
    }

    // 5) Transform for frontend
    const transformed = (privyData.transactions || []).map((tx: any) => {
      const isSent = tx.details?.type?.includes("sent");
      const displayValue = tx.details?.display_values?.[asset] || "0";
      
      return {
        id: tx.transaction_hash,
        hash: tx.transaction_hash,
        status: tx.status === "confirmed" ? "completed" : tx.status,
        type: isSent ? "withdrawal" : "deposit",
        amount: parseFloat(displayValue),
        currency: asset.toUpperCase(),
        description: isSent 
          ? `Envoyé ${asset.toUpperCase()}`
          : `Reçu ${asset.toUpperCase()}`,
        from_address: tx.details?.sender || null,
        to_address: tx.details?.recipient || null,
        network: chain.charAt(0).toUpperCase() + chain.slice(1),
        created_at: tx.created_at ? new Date(tx.created_at).toISOString() : new Date().toISOString(),
        fee: 0,
        confirmations: tx.status === "confirmed" ? 1 : 0,
      };
    });

    console.log(`🚀 Returning ${transformed.length} transformed transactions`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        transactions: transformed,
        next_cursor: privyData.next_cursor || null,
        total: transformed.length,
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("❌ Error in privy-transactions:", error.message);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        transactions: [],
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: error.message === "Unauthorized" ? 401 : 400,
      }
    );
  }
});
