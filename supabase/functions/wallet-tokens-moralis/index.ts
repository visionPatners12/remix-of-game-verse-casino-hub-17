// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const MORALIS_BASE = "https://deep-index.moralis.io/api/v2.2";
const MORALIS_API_KEY = Deno.env.get("MORALIS_API_KEY") ?? "";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...corsHeaders },
  });
}

function formatUnits(raw: string | number | bigint, decimals = 18): string {
  const s = typeof raw === "bigint" ? raw.toString() : String(raw);
  const neg = s.startsWith("-");
  const digits = neg ? s.slice(1) : s;
  const pad = digits.padStart(decimals + 1, "0");
  const int = pad.slice(0, -decimals);
  const frac = pad.slice(-decimals).replace(/0+$/, "");
  return `${neg ? "-" : ""}${int}${frac ? "." + frac : ""}`;
}

async function fetchMoralis(path: string, search?: Record<string, string | number | boolean>) {
  if (!MORALIS_API_KEY) throw new Error("Missing MORALIS_API_KEY");
  const url = new URL(`${MORALIS_BASE}/${path.replace(/^\//, "")}`);
  if (search) {
    Object.entries(search).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  }
  const res = await fetch(url.toString(), {
    headers: {
      "X-API-Key": MORALIS_API_KEY,
      accept: "application/json",
    },
  });
  const text = await res.text();
  let body: any;
  try { body = text ? JSON.parse(text) : null; } catch { body = { raw: text }; }
  if (!res.ok) {
    throw new Error(`Moralis ${res.status}: ${JSON.stringify(body)}`);
  }
  return body;
}

// ---- Moralis calls (v2.2) ----
// Native balance: GET /:address/balance?chain=...  (returns { balance }) 
// ERC-20 balances: GET /:address/erc20?chain=...   (returns Array<token>)
// NFTs by wallet (opt): GET /:address/nft?chain=... (paginated with cursor)

async function getNative(address: string, chain: string) {
  const data = await fetchMoralis(`${address}/balance`, { chain });
  return {
    balance_wei: data?.balance ?? "0",
    balance_formatted: formatUnits(data?.balance ?? "0", 18), // 18 par défaut
  };
}

async function getERC20(address: string, chain: string) {
  const tokens = await fetchMoralis(`${address}/erc20`, { chain });
  // tokens: [{ token_address, symbol, name, decimals, balance, possible_spam, logo, thumbnail, ... }]
  return Array.isArray(tokens) ? tokens : [];
}

async function getNFTsPaged(address: string, chain: string, limit = 100, maxPages = 1, excludeSpam = true) {
  const out: any[] = [];
  let cursor: string | undefined;
  for (let i = 0; i < maxPages; i++) {
    const page = await fetchMoralis(`${address}/nft`, {
      chain,
      format: "decimal",
      exclude_spam: excludeSpam,
      limit,
      ...(cursor ? { cursor } : {}),
    });
    if (Array.isArray(page?.result)) out.push(...page.result);
    cursor = page?.cursor || undefined;
    if (!cursor) break;
  }
  return out;
}

// Optionnel: enrichir chaque ERC-20 avec un prix USD (endpoint prix par token)
async function attachPrices(tokens: any[], chain: string, concurrency = 5) {
  const results: any[] = [];
  const queue = tokens.slice();
  const workers = Array.from({ length: Math.max(1, concurrency) }, async () => {
    while (queue.length) {
      const t = queue.shift()!;
      try {
        const p = await fetchMoralis(`erc20/${t.token_address}/price`, { chain });
        results.push({ ...t, usd_price: p?.usdPrice ?? null, usd_value: p?.usdPrice ? Number(t.balance) / (10 ** Number(t.decimals ?? 18)) * Number(p.usdPrice) : null });
      } catch {
        results.push({ ...t, usd_price: null, usd_value: null });
      }
    }
  });
  await Promise.all(workers);
  // Revenir à l'ordre initial
  const byAddr = new Map(results.map((r) => [r.token_address.toLowerCase(), r]));
  return tokens.map((t) => byAddr.get(t.token_address.toLowerCase()) ?? t);
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const isGet = req.method === "GET";
    const url = new URL(req.url);
    const qp = Object.fromEntries(url.searchParams.entries());
    const body = !isGet ? await req.json().catch(() => ({})) : {};
    const input = { ...body, ...qp };

    const address = String(input.address ?? "").trim();
    const chain = String(input.chain ?? "base"); // défaut: Base (8453)
    const includeNFTs = String(input.include_nfts ?? "false").toLowerCase() === "true";
    const withPrices = String(input.with_prices ?? "false").toLowerCase() === "true";
    const nftLimit = isNaN(Number(input.nft_limit)) ? 100 : Math.max(1, Math.min(100, Number(input.nft_limit)));
    const nftMaxPages = isNaN(Number(input.nft_pages)) ? 1 : Math.max(1, Math.min(10, Number(input.nft_pages)));

    if (!address) {
      return json({ error: "Paramètre 'address' requis" }, 400);
    }

    const [native, erc20Raw] = await Promise.all([
      getNative(address, chain),
      getERC20(address, chain),
    ]);

    const erc20 = withPrices ? await attachPrices(erc20Raw, chain) : erc20Raw;
    const nfts = includeNFTs ? await getNFTsPaged(address, chain, nftLimit, nftMaxPages, true) : undefined;

    return json({
      address,
      chain,
      meta: { source: "moralis", fetched_at: new Date().toISOString() },
      native,
      erc20,
      nfts,
    });
  } catch (err: any) {
    console.error(err);
    return json({ error: err?.message ?? "Unexpected error" }, 500);
  }
});