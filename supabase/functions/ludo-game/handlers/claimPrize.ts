// supabase/functions/ludo-game/handlers/claimPrize.ts
// deno-lint-ignore-file no-explicit-any

import { jsonOk, LudoHandledError } from "../lib/http.ts";
import { withRetryOnOptimistic, updateGameOptimistic } from "../lib/optimistic.ts";
import { fetchGame, getWalletAddressFromDb } from "../lib/db.ts";

// Wallet-auth JWT (ES256 / P-256)
import * as jose from "https://esm.sh/jose@5.9.6?target=deno";

// --------------------
// Constants: Base + USDC
// --------------------
const CDP_HOST = "api.cdp.coinbase.com";
const CDP_BASE = `https://${CDP_HOST}`;

const NETWORK = "base"; // CDP send-a-transaction supports `base` :contentReference[oaicite:2]{index=2}
const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // native USDC :contentReference[oaicite:3]{index=3}
const USDC_DECIMALS = 6; // USDC decimals (BaseScan shows 6) :contentReference[oaicite:4]{index=4}

type TxStatusEnum =
  | "received"
  | "pending_confirmations"
  | "confirmed"
  | "mismatch"
  | "reverted"
  | "timeout";

// --------------------
// Env
// --------------------
const SB_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SB_SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const CDP_WALLET_SECRET_RAW = Deno.env.get("CDP_WALLET_SECRET") ?? "";
const CDP_WALLET_SECRET = CDP_WALLET_SECRET_RAW.includes("\\n")
  ? CDP_WALLET_SECRET_RAW.replace(/\\n/g, "\n")
  : CDP_WALLET_SECRET_RAW;

const LUDO_TREASURY_EVM_ACCOUNT = Deno.env.get("LUDO_TREASURY_EVM_ACCOUNT") ?? "";

function requireEnv() {
  const miss: string[] = [];
  if (!SB_URL) miss.push("SUPABASE_URL");
  if (!SB_SERVICE_ROLE) miss.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!CDP_WALLET_SECRET) miss.push("CDP_WALLET_SECRET");
  if (!LUDO_TREASURY_EVM_ACCOUNT) miss.push("LUDO_TREASURY_EVM_ACCOUNT");
  if (miss.length) throw new Error(`Missing env: ${miss.join(", ")}`);
}

function isEvmAddress(s: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(s);
}

function isTxHash(s: string) {
  return /^0x[a-fA-F0-9]{64}$/.test(s);
}

// --------------------
// Helpers: encoding / amounts
// --------------------
function strip0x(s: string) {
  return s.startsWith("0x") ? s.slice(2) : s;
}

function hexToBytes(hex: string): Uint8Array {
  const h = strip0x(hex);
  if (h.length % 2) throw new Error("Invalid hex length");
  const out = new Uint8Array(h.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16);
  return out;
}

function concatBytes(...arrs: Uint8Array[]): Uint8Array {
  const total = arrs.reduce((a, b) => a + b.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const a of arrs) { out.set(a, o); o += a.length; }
  return out;
}

function bigIntToBytes(v: bigint): Uint8Array {
  if (v === 0n) return new Uint8Array([]);
  let hex = v.toString(16);
  if (hex.length % 2) hex = "0" + hex;
  return hexToBytes(hex);
}

function leftPad32(b: Uint8Array): Uint8Array {
  if (b.length > 32) throw new Error("Value too large");
  const out = new Uint8Array(32);
  out.set(b, 32 - b.length);
  return out;
}

// --- RLP encode (minimal) ---
function rlpEncodeBytes(input: Uint8Array): Uint8Array {
  const len = input.length;
  if (len === 1 && input[0] < 0x80) return input;
  if (len <= 55) return concatBytes(new Uint8Array([0x80 + len]), input);
  const lenBytes = bigIntToBytes(BigInt(len));
  return concatBytes(new Uint8Array([0xb7 + lenBytes.length]), lenBytes, input);
}

function rlpEncodeList(items: Uint8Array[]): Uint8Array {
  const payload = concatBytes(...items);
  const len = payload.length;
  if (len <= 55) return concatBytes(new Uint8Array([0xc0 + len]), payload);
  const lenBytes = bigIntToBytes(BigInt(len));
  return concatBytes(new Uint8Array([0xf7 + lenBytes.length]), lenBytes, payload);
}

function bytesToHex(bytes: Uint8Array): string {
  let s = "0x";
  for (const b of bytes) s += b.toString(16).padStart(2, "0");
  return s;
}

// EIP-1559 tx for CDP: type 0x02 + RLP([chainId, nonce, maxPrio, maxFee, gas, to, value, data, accessList])
// CDP expects "The RLP-encoded transaction … as a 0x-prefixed hex string" :contentReference[oaicite:5]{index=5}
function buildEip1559TxRlpHex(to: string, data: Uint8Array): string {
  const toBytes = hexToBytes(to);
  if (toBytes.length !== 20) throw new Error("Invalid `to` address");

  // Base chainId = 8453 (optional but nice)
  const chainId = 8453n;

  // Leave nonce/fees/gas empty -> CDP / account handles signing + sending
  const inner = rlpEncodeList([
    rlpEncodeBytes(bigIntToBytes(chainId)),
    rlpEncodeBytes(new Uint8Array([])), // nonce
    rlpEncodeBytes(new Uint8Array([])), // maxPriorityFeePerGas
    rlpEncodeBytes(new Uint8Array([])), // maxFeePerGas
    rlpEncodeBytes(new Uint8Array([])), // gasLimit
    rlpEncodeBytes(toBytes),
    rlpEncodeBytes(bigIntToBytes(0n)),   // value
    rlpEncodeBytes(data),
    rlpEncodeList([]),                   // accessList
  ]);

  return bytesToHex(concatBytes(new Uint8Array([0x02]), inner));
}

// ERC20 transfer(to, amount)
function encodeErc20Transfer(to: string, amount: bigint): Uint8Array {
  // transfer(address,uint256) selector = 0xa9059cbb
  const selector = hexToBytes("0xa9059cbb");
  const toBytes = hexToBytes(to);
  if (toBytes.length !== 20) throw new Error("Invalid recipient address");
  return concatBytes(selector, leftPad32(toBytes), leftPad32(bigIntToBytes(amount)));
}

// pot is decimal USDC (e.g. "12.34") -> base units (6 decimals)
function parseUnits(decimalStr: string, decimals: number): bigint {
  const s = decimalStr.trim();
  if (!/^\d+(\.\d+)?$/.test(s)) throw new Error(`Invalid amount: ${decimalStr}`);
  const [whole, frac = ""] = s.split(".");
  const fracPadded = (frac + "0".repeat(decimals)).slice(0, decimals);
  return BigInt(whole || "0") * (10n ** BigInt(decimals)) + BigInt(fracPadded || "0");
}

// --------------------
// X-Wallet-Auth generation (reqHash)
function sortKeys(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sortKeys);
  return Object.keys(obj).sort().reduce((acc: any, k: string) => {
    acc[k] = sortKeys(obj[k]);
    return acc;
  }, {});
}

async function sha256Hex(input: string) {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// CDP_WALLET_SECRET is base64 DER pkcs8
function base64ToBytes(b64: string) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function generateWalletAuthJwt(args: {
  requestMethod: string;
  requestHost: string;
  requestPath: string;
  requestBody: any;
}) {
  const now = Math.floor(Date.now() / 1000);
  const uri = `${args.requestMethod.toUpperCase()} ${args.requestHost}${args.requestPath}`;

  const payload: any = {
    iat: now,
    nbf: now,
    jti: crypto.randomUUID().replaceAll("-", ""),
    uris: [uri],
    reqHash: await sha256Hex(JSON.stringify(sortKeys(args.requestBody))),
  };

  const keyBytes = base64ToBytes(CDP_WALLET_SECRET);
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyBytes.buffer,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );

  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "ES256", typ: "JWT" })
    .sign(cryptoKey);
}

// --------------------
// Get Bearer from YOUR edge (cdp-session-token)
async function getBearerFromCdpSessionToken(requestPath: string): Promise<string> {
  const resp = await fetch(`${SB_URL}/functions/v1/cdp-session-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SB_SERVICE_ROLE}`,
      apikey: SB_SERVICE_ROLE,
    },
    body: JSON.stringify({
      requestMethod: "POST",
      requestHost: CDP_HOST,
      requestPath,
      expiresIn: 120,
    }),
  });

  const out = await resp.json().catch(() => null);
  if (!resp.ok || !out?.token) {
    throw new Error(`cdp-session-token failed (${resp.status}): ${JSON.stringify(out)}`);
  }
  return out.token as string;
}

// --------------------
// CDP send transaction
async function sendCdpTransaction(args: {
  idempotencyKey: string; // UUID v4 len 36 :contentReference[oaicite:6]{index=6}
  txRlpHex: string;
}): Promise<string> {
  const requestPath = `/platform/v2/evm/accounts/${LUDO_TREASURY_EVM_ACCOUNT}/send/transaction`;

  // CDP body: { network, transaction } :contentReference[oaicite:7]{index=7}
  const body = { network: NETWORK, transaction: args.txRlpHex };

  const bearer = await getBearerFromCdpSessionToken(requestPath);
  const xWalletAuth = await generateWalletAuthJwt({
    requestMethod: "POST",
    requestHost: CDP_HOST,
    requestPath,
    requestBody: body,
  });

  const resp = await fetch(`${CDP_BASE}${requestPath}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${bearer}`,
      "Content-Type": "application/json",
      "X-Wallet-Auth": xWalletAuth,
      "X-Idempotency-Key": args.idempotencyKey, // ✅ retry-safe :contentReference[oaicite:8]{index=8}
    },
    body: JSON.stringify(body),
  });

  const txt = await resp.text();
  let data: any = null;
  try { data = JSON.parse(txt); } catch { data = { raw: txt || resp.statusText }; }

  if (!resp.ok) throw new Error(`CDP send failed (${resp.status}): ${JSON.stringify(data)}`);

  const txHash = data?.transactionHash;
  if (!txHash) throw new Error(`Missing transactionHash: ${JSON.stringify(data)}`);
  return txHash as string;
}

// --------------------
// Handler
export async function handleClaimPrize(body: any, supabase: any, user: any) {
  requireEnv();

  const { gameId, force } = body;
  if (!gameId) throw new LudoHandledError("BAD_REQUEST", "Game ID is required");

  const game = await fetchGame(supabase, gameId);

  if (game.status !== "finished") throw new LudoHandledError("BAD_STATE", "Game is not finished");
  if (!game.winner_user_id) throw new LudoHandledError("BAD_STATE", "Missing winner_user_id");
  if (game.winner_user_id !== user.id) throw new LudoHandledError("FORBIDDEN", "Only the winner can claim");

  // Winner wallet
  const walletFromAuth =
    user?.user_metadata?.wallet_address ??
    user?.user_metadata?.evm_address ??
    null;

  const wallet = walletFromAuth ?? (await getWalletAddressFromDb(supabase, user.id));
  if (!wallet) throw new LudoHandledError("BAD_STATE", "Winner has no wallet_address");
  if (!isEvmAddress(wallet)) throw new LudoHandledError("BAD_STATE", "Invalid winner wallet_address");

  const currentRef: string | null = game.claim_tx_hash ?? null;
  const currentStatus: TxStatusEnum | null = game.claim_status ?? null;

  // Already sent/confirmed
  if (currentStatus === "confirmed" && currentRef && isTxHash(currentRef)) {
    return jsonOk({ ok: true, action: "already_confirmed", claim_status: "confirmed", claim_ref: currentRef });
  }
  if (currentRef && isTxHash(currentRef) && !force) {
    return jsonOk({
      ok: true,
      action: "already_sent",
      claim_status: currentStatus ?? "pending_confirmations",
      claim_ref: currentRef,
    });
  }

  // pot is in public.ludo_games.pot (USDC)
  const pot = game?.pot ?? null;
  if (pot === null || pot === undefined) throw new LudoHandledError("BAD_STATE", "Missing pot on ludo_games");
  const potStr = typeof pot === "string" ? pot : String(pot);

  const potUnits = parseUnits(potStr, USDC_DECIMALS);
  const payoutUnits = (potUnits * 9n) / 10n; // 90%
  if (payoutUnits <= 0n) throw new LudoHandledError("BAD_STATE", "Payout is 0 (pot too small?)");

  // Idempotency: reuse existing UUID (stored in claim_tx_hash) if present
  let idemKey =
    currentRef && !isTxHash(currentRef) && currentRef.length === 36
      ? currentRef
      : crypto.randomUUID();

  // Reserve BEFORE sending (avoid double payout). We store the idempotency key as claim_tx_hash.
  // If force=true => generate new idempotency key (new unique request). :contentReference[oaicite:9]{index=9}
  if (force) idemKey = crypto.randomUUID();

  await withRetryOnOptimistic(() =>
    updateGameOptimistic(
      supabase,
      gameId,
      { rev: game.rev ?? 0 },
      { claim_tx_hash: idemKey, claim_status: "received" as TxStatusEnum },
      "id,rev,claim_tx_hash,claim_status",
    ),
  );

  const locked = await fetchGame(supabase, gameId);
  if (locked.claim_tx_hash !== idemKey) {
    return jsonOk({
      ok: true,
      action: "lost_race",
      claim_status: locked.claim_status ?? "pending_confirmations",
      claim_ref: locked.claim_tx_hash ?? null,
    });
  }

  // Build ERC20 transfer tx (to USDC contract)
  const data = encodeErc20Transfer(wallet, payoutUnits);
  const txRlpHex = buildEip1559TxRlpHex(USDC_BASE, data);

  try {
    const txHash = await sendCdpTransaction({ idempotencyKey: idemKey, txRlpHex });

    await withRetryOnOptimistic(() =>
      updateGameOptimistic(
        supabase,
        gameId,
        { rev: locked.rev ?? 0, claim_tx_hash: idemKey },
        { claim_tx_hash: txHash, claim_status: "pending_confirmations" as TxStatusEnum },
        "id,rev,claim_tx_hash,claim_status",
      ),
    );

    return jsonOk({
      ok: true,
      action: "sent",
      claim_status: "pending_confirmations",
      claim_ref: txHash,
      idempotency_key: idemKey,
      payout_units: payoutUnits.toString(),
      token: "USDC",
      network: "base",
    });
  } catch (e: any) {
    // If CDP rejects because same idempotency key used with different payload => mismatch
    // (CDP idempotency rules) :contentReference[oaicite:10]{index=10}
    const msg = e?.message ?? String(e);
    const mapped: TxStatusEnum = msg.includes("idempotency") ? "mismatch" : "timeout";

    await withRetryOnOptimistic(() =>
      updateGameOptimistic(
        supabase,
        gameId,
        { rev: locked.rev ?? 0, claim_tx_hash: idemKey },
        { claim_status: mapped },
        "id,rev,claim_tx_hash,claim_status",
      ),
    );

    throw new LudoHandledError("PAYOUT_FAILED", `CDP payout failed: ${msg}`);
  }
}
