// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ethers, keccak256, toUtf8Bytes } from "https://esm.sh/ethers@6";

const APP = "[ens-subname:auto-wrapper+ensResult+fast]";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// ===== ENV with defaults =====
const RPC_URL           = Deno.env.get("RPC_URL")           || "https://ethereum-rpc.publicnode.com";
const ADMIN_PRIVATE_KEY = Deno.env.get("ADMIN_PRIVATE_KEY") || "";
const ENS_REGISTRY      = Deno.env.get("ENS_REGISTRY")      || "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
const ENS_RESOLVER      = Deno.env.get("ENS_RESOLVER")      || "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41";
const PARENT_NAME       = Deno.env.get("PARENT_NAME")       || "pryzen.eth";

const SUPABASE_URL              = Deno.env.get("SUPABASE_URL")              || "https://swgfutwpszlqdyrpwkhg.supabase.co";
const SUPABASE_ANON_KEY         = Deno.env.get("SUPABASE_ANON_KEY")         || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3Z2Z1dHdwc3pscWR5cnB3a2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzOTY0OTIsImV4cCI6MjA3MTk3MjQ5Mn0.GkT7YwcyE8nlE47kA-2sZgPYGK3nBgRtdE2DJZsMeJo";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const USER_ENS_COLUMN           = Deno.env.get("USER_ENS_COLUMN")           || "ens_subdomain";

// Fuses/expiry
const SUBNAME_FUSES  = Number(Deno.env.get("SUBNAME_FUSES")  || "65536");
const SUBNAME_EXPIRY = BigInt(Deno.env.get("SUBNAME_EXPIRY") || "0");

// Gas overrides (facultatif, valeurs sûres)
const GAS_SET_SUBNODE_OWNER  = BigInt(Deno.env.get("GAS_SET_SUBNODE_OWNER")  || "400000");
const GAS_SET_ADDR           = BigInt(Deno.env.get("GAS_SET_ADDR")           || "120000");
const GAS_SET_SUBNODE_RECORD = BigInt(Deno.env.get("GAS_SET_SUBNODE_RECORD") || "500000");

// ===== ABIs =====
const REGISTRY_ABI = [ "function owner(bytes32 node) view returns (address)" ];
const WRAPPER_ABI = [
  "function isApprovedForAll(address account, address operator) view returns (bool)",
  "function ownerOf(uint256 id) view returns (address)",
  "function setSubnodeOwner(bytes32 parentNode, string label, address newOwner, uint32 fuses, uint64 expiry)",
  "function setSubnodeRecord(bytes32 parentNode, string label, address owner, address resolver, uint64 ttl, uint32 fuses, uint64 expiry)"
];
const RESOLVER_ABI = [ "function setAddr(bytes32 node, address a)" ];

// ===== utils =====
type ENSGenerationResult = {
  success: boolean;
  ensName?: string;
  depositAddress?: string;
  message?: string;
  error?: string;
};

const respond = (res: ENSGenerationResult) =>
  new Response(JSON.stringify(res, null, 2), { status: 200, headers: { "content-type": "application/json", ...CORS } });

const isEth   = (a: string) => /^0x[a-fA-F0-9]{40}$/.test(a);
const isLabel = (s: string) => /^[a-z0-9-]{1,63}$/.test(s);
const short   = (x?: string | null) => (!x || x.length < 10) ? (x ?? "") : `${x.slice(0,6)}…${x.slice(-4)}`;

function namehash(name: string): `0x${string}` {
  let node = "0x" + "00".repeat(32);
  if (!name) return node as `0x${string}`;
  const labels = name.split(".").reverse();
  for (const l of labels) {
    const lh = keccak256(toUtf8Bytes(l));
    node = keccak256(ethers.concat([node, lh]));
  }
  return node as `0x${string}`;
}

// préchecks réseau
async function preflight(provider: ethers.Provider) {
  if (!/^https?:\/\//i.test(RPC_URL)) throw new Error("RPC_URL doit être une URL http(s) complète");
  if (!ADMIN_PRIVATE_KEY) throw new Error("ADMIN_PRIVATE_KEY manquant");
  if (!ENS_RESOLVER) throw new Error("ENS_RESOLVER manquant (adresse du Public Resolver)");
  const net = await (provider as ethers.JsonRpcProvider).getNetwork();
  const [codeReg, codeRes] = await Promise.all([
    provider.getCode(ENS_REGISTRY),
    provider.getCode(ENS_RESOLVER),
  ]);
  console.log(APP, "preflight → chainId:", Number(net.chainId), "| registry:", codeReg==="0x"?"NONE":"OK", "| resolver:", codeRes==="0x"?"NONE":"OK");
  if (codeReg === "0x") throw new Error(`ENS_REGISTRY (${ENS_REGISTRY}) introuvable sur chainId=${Number(net.chainId)}`);
  if (codeRes === "0x") throw new Error(`ENS_RESOLVER (${ENS_RESOLVER}) introuvable sur chainId=${Number(net.chainId)}`);
}

// ===== FIRE-AND-FORGET on-chain =====
// Soumet les 3 tx avec nonces explicites et gasLimit définis, NE PAS attendre les confirmations.
async function createSubnameViaWrapperFireAndForget(
  wrapperAddr: string,
  wallet: ethers.Wallet,
  parentNode: `0x${string}`,
  label: string,
  userAddr: string,
) {
  console.log(APP, "wrapper.create (fast) →", short(wrapperAddr), "| label:", label, "| user:", short(userAddr),
              "| fuses:", SUBNAME_FUSES, "| expiry:", String(SUBNAME_EXPIRY));
  const wrapper  = new ethers.Contract(wrapperAddr, WRAPPER_ABI, wallet);
  const resolver = new ethers.Contract(ENS_RESOLVER, RESOLVER_ABI, wallet);
  const subNode  = namehash(`${label}.${PARENT_NAME}`);

  // IMPORTANT : on construit les tx via populateTransaction
  const [tx1Data, tx2Data, tx3Data] = await Promise.all([
    wrapper.getFunction("setSubnodeOwner").populateTransaction(parentNode, label, wallet.address, 0, 0),
    resolver.getFunction("setAddr").populateTransaction(subNode, userAddr),
    wrapper.getFunction("setSubnodeRecord").populateTransaction(parentNode, label, userAddr, ENS_RESOLVER, 0, SUBNAME_FUSES, SUBNAME_EXPIRY),
  ]);

  // Nonce de base (pending), puis envoie 3 tx consécutives
  const baseNonce = await wallet.getNonce("pending");
  console.log(APP, "nonce(base):", baseNonce);

  const tx1 = await wallet.sendTransaction({ ...tx1Data, gasLimit: GAS_SET_SUBNODE_OWNER,  nonce: baseNonce     });
  console.log(APP, "tx1 submitted:", tx1.hash);

  const tx2 = await wallet.sendTransaction({ ...tx2Data, gasLimit: GAS_SET_ADDR,           nonce: baseNonce + 1  });
  console.log(APP, "tx2 submitted:", tx2.hash);

  const tx3 = await wallet.sendTransaction({ ...tx3Data, gasLimit: GAS_SET_SUBNODE_RECORD, nonce: baseNonce + 2  });
  console.log(APP, "tx3 submitted:", tx3.hash);

  // ⚡️ on ne fait PAS await tx.wait() — on renvoie immédiatement
  return { tx1: tx1.hash, tx2: tx2.hash, tx3: tx3.hash };
}

serve(async (req) => {
  console.log(APP, "req:", req.method, req.url);
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  if (req.method === "GET") {
    try {
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      await preflight(provider);
      const parentNode = namehash(PARENT_NAME);
      const registry   = new ethers.Contract(ENS_REGISTRY, REGISTRY_ABI, provider);
      const regOwner: string = await registry.owner(parentNode);
      const isContract = (await provider.getCode(regOwner)) !== "0x";
      const msg = `ready: parent=${PARENT_NAME}, wrapped=${isContract}`;
      console.log(APP, msg, "| registryOwner:", short(regOwner));
      return respond({ success: true, message: msg });
    } catch (e: any) {
      console.error(APP, "GET error:", e);
      return respond({ success: false, error: String(e?.message || e) });
    }
  }

  if (req.method !== "POST") return respond({ success: false, error: "Use POST" });

  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return respond({ success: false, error: "ENV Supabase manquantes" });
    }
    const auth = req.headers.get("Authorization") || "";
    if (!auth.startsWith("Bearer ")) {
      return respond({ success: false, error: "Authorization Bearer requis" });
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    await preflight(provider);
    const admin = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
    console.log(APP, "admin:", short(admin.address));

    // clients (service-role pour UPDATE si dispo)
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: auth } } });
    const dbClient   = SUPABASE_SERVICE_ROLE_KEY
      ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      : userClient;
    console.log(APP, "DB client:", SUPABASE_SERVICE_ROLE_KEY ? "service-role" : "user (RLS)");

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return respond({ success: false, error: "Session invalide" });
    const userId = userData.user.id;
    console.log(APP, "user:", userId);

    // s'assurer que la ligne users existe
    const { data: profileRow, error: profErr } = await userClient.from("users").select("id").eq("id", userId).maybeSingle();
    if (profErr) return respond({ success: false, error: `Lecture users échouée: ${profErr.message}` });
    if (!profileRow) return respond({ success: false, error: "Aucune ligne dans public.users pour cet utilisateur" });

    // wallet (dernier user_wallet)
    console.log(APP, "DB → user_wallet.latest");
    const { data: uw, error: uwErr } = await userClient
      .from("user_wallet")
      .select("wallet_address")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);
    if (uwErr) return respond({ success: false, error: "Lecture user_wallet échouée" });
    const walletAddress = (uw?.[0]?.wallet_address || "").trim();
    console.log(APP, "wallet:", short(walletAddress));
    if (!isEth(walletAddress)) return respond({ success: false, error: "Aucune wallet_address valide dans user_wallet" });

    // label
    const body = await req.json().catch(() => ({}));
    const rawLabel = String(body?.label || "").trim();
    if (!isLabel(rawLabel)) return respond({ success: false, error: "label invalide (a-z 0-9 - ; 1..63)" });
    const label = rawLabel;
    const fqdn  = `${label}.${PARENT_NAME}`;
    console.log(APP, "label:", label, "| fqdn:", fqdn);

    // wrapper depuis Registry.owner(parent)
    const parentNode = namehash(PARENT_NAME);
    const registry   = new ethers.Contract(ENS_REGISTRY, REGISTRY_ABI, provider);
    const wrapperAddr: string = await registry.owner(parentNode);
    const ownerCode = await provider.getCode(wrapperAddr);
    console.log(APP, "wrapperAddr:", wrapperAddr, "| isContract:", ownerCode!=="0x");
    if (ownerCode === "0x") {
      return respond({ success: false, error: "Le parent n'est pas wrapped (owner Registry n'est pas un contrat)" });
    }

    // (optionnel) check perms pour message clair
    try {
      const wrapperRO = new ethers.Contract(wrapperAddr, WRAPPER_ABI, provider);
      const ownerWrapped: string = await wrapperRO.ownerOf(ethers.toBigInt(parentNode));
      const isOwner = ownerWrapped.toLowerCase() === admin.address.toLowerCase();
      let isOp = false;
      if (!isOwner) isOp = await wrapperRO.isApprovedForAll(ownerWrapped, admin.address);
      console.log(APP, "wrapper perms → owner:", short(ownerWrapped), "| isOwner:", isOwner, "| isApprovedForAll:", isOp);
      if (!isOwner && !isOp) {
        return respond({ success: false, error: "Pas autorisé: setApprovalForAll(admin, true) requis sur le NameWrapper" });
      }
    } catch (_) {}

    // ===== envoi des 3 transactions (NON BLOQUANT) =====
    let submitted;
    try {
      submitted = await createSubnameViaWrapperFireAndForget(wrapperAddr, admin, parentNode, label, walletAddress);
    } catch (e: any) {
      console.error(APP, "on-chain submit error:", e?.reason || e?.message || e);
      return respond({ success: false, error: String(e?.reason || e?.message || e) });
    }

    // ===== UPDATE DB immédiatement (sans attendre les confirmations) =====
    const patch: Record<string, any> = {};
    patch[USER_ENS_COLUMN] = fqdn;
    console.log(APP, "DB update users.", USER_ENS_COLUMN, "=", fqdn);
    const { data: updatedRows, error: upErr } = await dbClient
      .from("users")
      .update(patch)
      .eq("id", userId)
      .select("id");
    if (upErr) {
      console.error(APP, "DB update error:", upErr.message);
      // On ne bloque pas la livraison — on signale l'erreur côté front
      return respond({
        success: true,                        // txs bien soumises
        ensName: fqdn,
        depositAddress: walletAddress,
        message: `Transactions soumises (en attente). tx1=${short(submitted.tx1)} tx2=${short(submitted.tx2)} tx3=${short(submitted.tx3)}. DB non mise à jour.`,
        error: `DB update failed: ${upErr.message}`
      });
    }
    const affected = Array.isArray(updatedRows) ? updatedRows.length : 0;
    console.log(APP, "DB update affected rows:", affected);

    // Réponse immédiate pour le front
    return respond({
      success: true,
      ensName: fqdn,
      depositAddress: walletAddress,
      message: `Transactions soumises (en attente). tx1=${short(submitted.tx1)} tx2=${short(submitted.tx2)} tx3=${short(submitted.tx3)}`
    });

  } catch (e: any) {
    console.error(APP, "fatal:", e);
    return respond({ success: false, error: String(e?.message || e) });
  }
});