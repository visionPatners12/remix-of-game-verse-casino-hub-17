import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const addressRegex = /^0x[a-fA-F0-9]{40}$/;
const txHashRegex = /^0x[a-fA-F0-9]{64}$/;

// keccak256("Transfer(address,address,uint256)")
const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const USDT_DECIMALS = 6;

// === Helpers ===

function normalizeAddress(addr: string | null | undefined): string | null {
  if (!addr || typeof addr !== "string") return null;
  if (!addressRegex.test(addr)) return null;
  return addr.toLowerCase();
}

function decimalToUnits(amount: string, decimals: number): bigint {
  const trimmed = amount.trim();
  if (!trimmed) return 0n;

  const negative = trimmed.startsWith("-");
  const unsigned = negative ? trimmed.slice(1) : trimmed;

  const [intPartRaw, fracPartRaw = ""] = unsigned.split(".");
  const intPart = intPartRaw.replace(/^0+/, "") || "0";

  let fracPart = fracPartRaw.padEnd(decimals, "0");
  fracPart = fracPart.slice(0, decimals);

  const full = intPart === "0" && fracPart === "0".repeat(decimals) ? "0" : intPart + fracPart;

  const units = BigInt(full);
  return negative ? -units : units;
}

function topicToAddress(topic: string): string | null {
  if (!topic || !topic.startsWith("0x") || topic.length < 66) return null;
  const hex = topic.slice(-40);
  return ("0x" + hex).toLowerCase();
}

function hexToBigInt(hex: string): bigint {
  if (!hex.startsWith("0x")) {
    throw new Error("hexToBigInt expects 0x-prefixed string");
  }
  return BigInt(hex);
}

interface TransactionReceipt {
  status: string;
  logs: Array<{
    address?: string;
    topics?: string[];
    data?: string;
  }>;
}

async function getTransactionReceipt(
  rpcUrl: string,
  txHash: string
): Promise<TransactionReceipt | null> {
  const body = {
    jsonrpc: "2.0",
    id: 1,
    method: "eth_getTransactionReceipt",
    params: [txHash],
  };

  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error("[poll-tipster-subscriptions] RPC error status:", res.status);
    throw new Error(`RPC error: ${res.status}`);
  }

  const json = await res.json();
  if (json.error) {
    console.error("[poll-tipster-subscriptions] RPC returned error:", json.error);
    throw new Error(json.error.message || "RPC error");
  }

  return json.result ?? null;
}

// === Edge Function ===

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method Not Allowed. Use GET or POST." }),
      { status: 405, headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    // Use RPC_POLYGON_URL if set, otherwise fallback to public Polygon RPC
    const RPC_POLYGON_URL = Deno.env.get("RPC_POLYGON_URL") || "https://polygon-rpc.com";
    const USDT_POLYGON_ADDRESS = (
      Deno.env.get("USDT_POLYGON_ADDRESS") ?? "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"
    ).toLowerCase();

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing env: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }),
        { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 20, 100) : 20;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1) Fetch pending subscriptions with tx_hash
    const { data: subscriptions, error: subError } = await supabase
      .from("tipster_subscriptions")
      .select(`
        id,
        tx_hash,
        amount,
        from_address,
        status,
        subscriber_id,
        tipster_profile_id,
        tipster_profile:tipster_profile_id (
          split_contract_address,
          user_id
        )
      `)
      .eq("status", "pending")
      .not("tx_hash", "is", null)
      .limit(limit);

    if (subError) {
      console.error("[poll-tipster-subscriptions] Error fetching pending subscriptions:", subError.message);
      return new Response(
        JSON.stringify({ error: "Failed to fetch pending subscriptions", details: subError.message }),
        { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, processed: 0, activated: 0, failed: 0 }),
        { status: 200, headers: { ...corsHeaders, "content-type": "application/json" } }
      );
    }

    console.log(`[poll-tipster-subscriptions] Processing ${subscriptions.length} pending subscriptions`);

    let processed = 0;
    let activated = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      processed++;

      const txHash: string | null = sub.tx_hash;
      const amount = sub.amount;
      const fromAddress: string | null = sub.from_address;
      // tipster_profile comes as array from join, take first element
      // Supabase returns joined relations as arrays
      const tipsterProfileData = sub.tipster_profile;
      const tipsterProfile = Array.isArray(tipsterProfileData) 
        ? tipsterProfileData[0] as { split_contract_address: string | null; user_id: string | null } | undefined
        : tipsterProfileData as { split_contract_address: string | null; user_id: string | null } | null;
      const splitAddress: string | null = tipsterProfile?.split_contract_address ?? null;

      if (!txHash || !txHashRegex.test(txHash)) {
        console.warn("[poll-tipster-subscriptions] Skipping subscription with invalid tx_hash:", sub.id);
        continue;
      }

      if (!splitAddress || !addressRegex.test(splitAddress)) {
        console.warn("[poll-tipster-subscriptions] Skipping subscription with invalid split_contract_address:", sub.id);
        continue;
      }

      if (amount == null) {
        console.warn("[poll-tipster-subscriptions] Skipping subscription with null amount:", sub.id);
        continue;
      }

      const split = normalizeAddress(splitAddress)!;
      const expectedAmountUnits = decimalToUnits(String(amount), USDT_DECIMALS);

      let onchainReceipt: TransactionReceipt | null = null;

      try {
        onchainReceipt = await getTransactionReceipt(RPC_POLYGON_URL, txHash);
      } catch (e) {
        console.error("[poll-tipster-subscriptions] RPC error for tx_hash", txHash, e);
        continue;
      }

      // Transaction not yet mined
      if (!onchainReceipt) {
        console.log(`[poll-tipster-subscriptions] Tx ${txHash} not yet mined`);
        continue;
      }

      // Transaction failed on-chain
      if (onchainReceipt.status === "0x0") {
        console.warn(`[poll-tipster-subscriptions] Tx ${txHash} failed on chain, marking as failed`);
        await supabase
          .from("tipster_subscriptions")
          .update({ status: "failed" })
          .eq("id", sub.id);
        failed++;
        continue;
      }

      // Parse logs for USDT Transfer
      const logs = onchainReceipt.logs ?? [];
      let matched = false;

      for (const log of logs) {
        const logAddress = log.address?.toLowerCase();
        if (!logAddress || logAddress !== USDT_POLYGON_ADDRESS) continue;

        const topics = log.topics ?? [];
        if (topics.length < 3) continue;
        if (topics[0].toLowerCase() !== TRANSFER_TOPIC) continue;

        const fromOnChain = normalizeAddress(topicToAddress(topics[1]));
        const toOnChain = normalizeAddress(topicToAddress(topics[2]));

        if (!fromOnChain || !toOnChain) continue;
        if (toOnChain !== split) continue;

        // Verify sender if stored
        if (fromAddress) {
          const fromStored = normalizeAddress(fromAddress);
          if (fromStored && fromStored !== fromOnChain) continue;
        }

        const dataHex = log.data ?? "0x0";
        let valueUnits: bigint;
        try {
          valueUnits = hexToBigInt(dataHex);
        } catch {
          continue;
        }

        if (valueUnits < expectedAmountUnits) {
          continue;
        }

        matched = true;
        break;
      }

      if (!matched) {
        console.log(`[poll-tipster-subscriptions] No matching USDT transfer found for subscription ${sub.id}`);
        continue;
      }

      // 2) Activate the subscription
      const now = new Date();
      const start = now.toISOString();
      const endDate = new Date(now);
      endDate.setMonth(endDate.getMonth() + 1);
      const end = endDate.toISOString();

      const { error: updateError } = await supabase
        .from("tipster_subscriptions")
        .update({
          status: "active",
          subscription_start: start,
          subscription_end: end,
        })
        .eq("id", sub.id);

      if (updateError) {
        console.error("[poll-tipster-subscriptions] Error updating subscription to active:", sub.id, updateError.message);
        continue;
      }

      console.log(`[poll-tipster-subscriptions] Activated subscription ${sub.id}`);
      activated++;
    }

    return new Response(
      JSON.stringify({ success: true, processed, activated, failed }),
      { status: 200, headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  } catch (err) {
    console.error("[poll-tipster-subscriptions] Unexpected error:", err);
    return new Response(
      JSON.stringify({
        error: "Unexpected error",
        details: err instanceof Error ? err.message : String(err),
      }),
      { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  }
});
