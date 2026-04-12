// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";
import * as jose from "https://esm.sh/jose@5.9.6?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, privy-id-token"
};

// ---------- Config ----------
const PRIVY_APP_ID = Deno.env.get("PRIVY_APP_ID") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const FALLBACK_REDIRECT_BASE = "https://preview--game-verse-casino-hub-91.lovable.app";

function normalizeRedirectBase(url: string): string {
  const t = url.trim().replace(/\/$/, "");
  if (!t.startsWith("http://") && !t.startsWith("https://")) return `https://${t}`;
  return t;
}

/** Only allow overriding production redirect for local dev (magic link redirectTo). */
function isLocalDevRedirectBase(urlStr: string): boolean {
  try {
    const u = new URL(urlStr.match(/^https?:\/\//) ? urlStr : `https://${urlStr}`);
    return u.hostname === "localhost" || u.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function pickRedirectBase(req: Request, bodyRedirectBase: unknown): string {
  const fromBody = typeof bodyRedirectBase === "string" ? bodyRedirectBase.trim() : "";
  if (fromBody && isLocalDevRedirectBase(fromBody)) return normalizeRedirectBase(fromBody);
  const origin = req.headers.get("origin")?.trim() ?? "";
  if (origin && isLocalDevRedirectBase(origin)) return normalizeRedirectBase(origin);
  const envBase = Deno.env.get("REDIRECT_BASE_URL")?.trim();
  if (envBase) return normalizeRedirectBase(envBase);
  // Production: same as before — use browser Origin when secret not set (not localhost)
  if (origin && (origin.startsWith("https://") || origin.startsWith("http://"))) {
    try {
      const u = new URL(origin);
      if (u.hostname !== "localhost" && u.hostname !== "127.0.0.1") {
        return normalizeRedirectBase(origin);
      }
    } catch {
      /* ignore */
    }
  }
  return FALLBACK_REDIRECT_BASE;
}

// JWKS distant de ton app Privy (jose résout automatiquement le bon `kid`)
const JWKS_URL = new URL(`https://auth.privy.io/api/v1/apps/${PRIVY_APP_ID}/jwks.json`);
const JWKS = jose.createRemoteJWKSet(JWKS_URL);

// ---------- Helpers ----------
async function emailFromWallet(walletAddressOrId: string) {
  const enc = new TextEncoder().encode(walletAddressOrId);
  const hash = await crypto.subtle.digest("SHA-256", enc);
  const hex = [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 32)}@privy.io`;
}
function parseLinkedAccounts(payload: any) {
  try {
    const raw = payload?.linked_accounts || "[]";
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
function pickPrimaryWallet(accounts: any[]) {
  return accounts.find((a) => a?.type === "wallet");
}
function pickPrimaryEmail(accounts: any[]) {
  return accounts.find((a) => a?.type === "email");
}
function getUserType(accounts: any[]) {
  if (accounts.some((a) => a?.type === "email")) return "email";
  if (accounts.some((a) => a?.type === "wallet")) return "wallet";
  return "wallet";
}
function inferConnectionMethods(accounts: any[]) {
  const methods = new Set<string>();
  for (const a of accounts) if (a?.type) methods.add(a.type);
  return [...methods];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    // 1) Récupérer et vérifier le token Privy
    const headerToken = req.headers.get("privy-id-token");
    const body = await req.json().catch(() => ({}));
    const idToken = headerToken || body?.privyToken || body?.privyIdToken;
    if (!idToken) throw new Error("Missing Privy identity token");

    const { payload } = await jose.jwtVerify(idToken, JWKS, {
      issuer: "privy.io",
      audience: PRIVY_APP_ID,
    });

    const accounts = parseLinkedAccounts(payload);
    const wallet = pickPrimaryWallet(accounts);
    const emailAccount = pickPrimaryEmail(accounts);
    const userType = getUserType(accounts);
    const connectionMethods = inferConnectionMethods(accounts);
    const privyId = payload.sub; // did:privy:...

    console.log("🔐 User type:", userType, "methods:", connectionMethods);

    // 2) Supabase admin
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 3) Chercher d'abord dans public.users (profil)
    let { data: existingUser, error: userFetchErr } = await admin
      .from("users")
      .select("id, username, email, privy_user_id, onboarding_completed, auth_method, wallet_address")
      .eq("privy_user_id", privyId)
      .maybeSingle();

    if (userFetchErr) console.error("❌ Fetch by privy_user_id:", userFetchErr);

    if (!existingUser) {
      console.log("🔍 No user by privy_id, try fallbacks...");
      if (userType === "wallet" && wallet?.address) {
        const { data, error } = await admin
          .from("users")
          .select("id, username, email, privy_user_id, onboarding_completed, auth_method, wallet_address")
          .eq("wallet_address", wallet.address)
          .maybeSingle();
        if (!error && data) existingUser = data;
      }
      if (!existingUser && userType === "email" && emailAccount?.address) {
        const { data, error } = await admin
          .from("users")
          .select("id, username, email, privy_user_id, onboarding_completed, auth_method, wallet_address")
          .eq("email", emailAccount.address)
          .maybeSingle();
        if (!error && data) existingUser = data;
      }
    }

    // 4) Préparer identités & emails
    let isNewUser = !existingUser;
    let theUserId: string | null = null;

    // On va décider de l'email A UTILISER POUR LE MAGIC LINK
    // IMPORTANT: si existingUser => on privilégie l'email de l'AUTH USER existant
    let emailForAuth: string | null = null; // celui qui sert au magic link
    let emailForUser: string | null = null; // celui qu'on stocke dans public.users (vrai email si connu)
    let username: string;

    if (existingUser) {
      console.log("👤 Existing profile:", existingUser.id, existingUser.username);
      theUserId = existingUser.id;

      // MàJ profil si besoin (privy_user_id, auth_method, wallet_address)
      const patch: any = {};
      if (!existingUser.privy_user_id) patch.privy_user_id = privyId;
      if (userType === "wallet" && wallet?.address) {
        if (existingUser.auth_method !== "wallet") patch.auth_method = "wallet";
        if (existingUser.wallet_address !== wallet.address) patch.wallet_address = wallet.address;
      } else if (userType === "email" && existingUser.auth_method !== "email") {
        patch.auth_method = "email";
      }
      if (Object.keys(patch).length > 0) {
        const { error } = await admin.from("users").update(patch).eq("id", existingUser.id);
        if (error) console.error("❌ Update profile:", error);
        else Object.assign(existingUser, patch);
      }

      // 4.a Récupérer l'auth.user pour CET ID afin d'obtenir l'email exact (source de vérité pour magic link)
      let authUserEmail: string | null = null;
      try {
        const { data: authRes, error: authErr } = await admin.auth.admin.getUserById(existingUser.id);
        if (authErr) console.error("❌ getUserById:", authErr);
        authUserEmail = authRes?.user?.email ?? null;
      } catch (e) {
        console.error("❌ getUserById exception:", e);
      }

      // Stratégie email:
      // - si l'auth.user a un email -> on l'utilise pour le magic link (évite toute création d'un nouveau auth.user)
      // - sinon si le profil a un email -> on tente avec celui-là (doit correspondre à l'auth user existant)
      // - sinon (profil wallet pur sans email), on TIENT À NE PAS CRÉER de nouvel auth.user différent → on bloque proprement
      if (authUserEmail) {
        emailForAuth = authUserEmail;
        emailForUser = existingUser.email ?? authUserEmail;
      } else if (existingUser.email) {
        emailForAuth = existingUser.email;
        emailForUser = existingUser.email;
      } else {
        // Cas “compte legacy wallet-only sans email” :
        // Générer un magic link créerait un NOUVEL auth.user → duplication.
        // Deux options:
        //   A) arrêter avec un message “migration requise”
        //   B) créer un nouvel auth.user (email déterministe) ET migrer public.users.id vers ce nouvel id (FKs ON UPDATE CASCADE requis)
        // Ici, on choisit A par défaut (sécurisé).
        throw new Error("ACCOUNT_MERGE_REQUIRED: existing profile has no auth.user email; avoid creating a duplicate auth user.");
      }

      username = existingUser.username || "user";
      isNewUser = false;

    } else {
      // 5) Nouveau profil
      if (userType === "email" && emailAccount?.address) {
        emailForAuth = emailAccount.address;
        emailForUser = emailAccount.address;
        username = emailAccount.address.split("@")[0];
      } else if (userType === "wallet" && wallet?.address) {
        emailForAuth = await emailFromWallet(wallet.address); // email synthétique pour auth
        emailForUser = null;
        username = wallet.address;
      } else {
        const fallbackId = privyId || "unknown";
        emailForAuth = await emailFromWallet(fallbackId);
        emailForUser = null;
        username = fallbackId;
      }
    }

    if (!emailForAuth) {
      throw new Error("No email available to generate a magic link without creating duplicates.");
    }

    // 6) Redirect base for magic link (local: Origin / body.redirect_base; prod: REDIRECT_BASE_URL)
    const redirectBase = pickRedirectBase(req, body?.redirect_base);
    const finalRedirectUrl = `${redirectBase}/auth`;

    // 7) Générer le magic link **MAINTENANT** avec l'email résolu (et cohérent avec l'auth.user existant)
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: emailForAuth,
      options: { redirectTo: finalRedirectUrl },
    });
    if (linkErr) throw new Error(`Failed to generate magic link: ${linkErr.message}`);

    // 8) Créer/Upserter le profil si nécessaire
    if (isNewUser) {
      theUserId = linkData.user.id; // id du nouvel auth.user
      const { error: upsertErr } = await admin.from("users").upsert({
        id: theUserId,
        privy_user_id: privyId,
        email: emailForUser,
        username,
        auth_method: userType === "wallet" ? "wallet" : "email",
        wallet_address: wallet?.address ?? null,
        onboarding_completed: false,
      });
      if (upsertErr) throw new Error(`Failed to create user profile: ${upsertErr.message}`);
    } else {
      theUserId = existingUser!.id;

      // Garde-fou anti-duplication: si Supabase nous renvoie un user.id différent alors qu'on avait un profil existant,
      // c'est que l'email utilisé ne correspondait pas à l'auth.user attendu.
      if (linkData?.user?.id && linkData.user.id !== theUserId) {
        console.error("❌ Email mismatch would create a duplicate auth.user. Aborting.");
        throw new Error("EMAIL_MISMATCH_WOULD_CREATE_DUPLICATE");
      }
    }

    // 9) Sauver le wallet (pour tous les cas)
    if (wallet?.address) {
      const { error: walletErr } = await admin.from("user_wallet").upsert(
        {
          user_id: theUserId,
          wallet_address: wallet.address,
          wallet_type: wallet.wallet_client_type || "unknown",
        },
        { onConflict: "user_id,wallet_address" }
      );
      if (walletErr) console.error("❌ Save wallet:", walletErr);
    }

    // 10) Retour
    const sessionUrl = linkData?.properties?.action_link ?? null;
    const userResponse = {
      id: theUserId,
      did: payload.sub,
      privy_user_id: privyId,
      email: emailForUser,
      auth_email: emailForAuth,
      wallet_address: wallet?.address ?? null,
      username,
      methods: connectionMethods,
      is_new_user: isNewUser,
    };

    console.log("✅ Final user:", userResponse);

    return new Response(
      JSON.stringify({
        success: true,
        user: userResponse,
        session_url: sessionUrl,
        redirect_url: finalRedirectUrl,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Privy auth error:", err);
    return new Response(JSON.stringify({ error: err?.message || "Authentication failed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
