// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, X-Backend-Wallet-Address",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const addressRegex = /^0x[a-fA-F0-9]{40}$/;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method Not Allowed. Use POST." }),
      {
        status: 405,
        headers: { ...corsHeaders, "content-type": "application/json" },
      },
    );
  }

  try {
    // ───────────────────────────────────────────
    // 1) ENV VARS
    // ───────────────────────────────────────────
    const ENGINE_URL = Deno.env.get("THIRDWEB_ENGINE_URL");
    const ACCESS_TOKEN = Deno.env.get("THIRDWEB_ENGINE_ACCESS_TOKEN");
    const BACKEND_WALLET = Deno.env.get("THIRDWEB_BACKEND_WALLET");
    const MASTER_WALLET = Deno.env.get("MASTER_WALLET");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (
      !ENGINE_URL ||
      !ACCESS_TOKEN ||
      !BACKEND_WALLET ||
      !MASTER_WALLET ||
      !SUPABASE_URL ||
      !SUPABASE_SERVICE_ROLE_KEY
    ) {
      console.error("❌ Missing environment variables");
      return new Response(
        JSON.stringify({
          error: "Missing environment variables",
          details:
            "THIRDWEB_ENGINE_URL, THIRDWEB_ENGINE_ACCESS_TOKEN, THIRDWEB_BACKEND_WALLET, MASTER_WALLET",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "content-type": "application/json" },
        },
      );
    }

    if (!addressRegex.test(MASTER_WALLET)) {
      console.error("❌ Invalid MASTER_WALLET address format:", MASTER_WALLET);
      return new Response(
        JSON.stringify({
          error: "Invalid MASTER_WALLET address format",
          details: MASTER_WALLET,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "content-type": "application/json" },
        },
      );
    }

    // ───────────────────────────────────────────
    // 2) AUTH: user_id depuis le JWT
    // ───────────────────────────────────────────
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      console.error("❌ Missing or invalid Authorization header");
      return new Response(
        JSON.stringify({ error: "Missing or invalid Authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "content-type": "application/json" },
        },
      );
    }

    const jwt = authHeader.replace("Bearer ", "").trim();

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(jwt);

    if (userError || !user) {
      console.error("❌ Unable to get user from JWT:", userError?.message);
      return new Response(
        JSON.stringify({
          error: "Unable to get user from JWT",
          details: userError?.message,
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "content-type": "application/json" },
        },
      );
    }

    const userId = user.id;
    console.log("✅ Authenticated user:", userId);

    // ───────────────────────────────────────────
    // 3) Récupérer wallet_address dans public.users
    // ───────────────────────────────────────────
    const { data: userRow, error: userRowError } = await supabase
      .from("users")
      .select("id, wallet_address")
      .eq("id", userId)
      .single();

    if (userRowError || !userRow) {
      console.error("❌ User not found in public.users:", userRowError?.message);
      return new Response(
        JSON.stringify({
          error: "User not found in public.users",
          details: userRowError?.message,
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "content-type": "application/json" },
        },
      );
    }

    const walletAddress = userRow.wallet_address as string | null;

    if (!walletAddress || !addressRegex.test(walletAddress)) {
      console.error("❌ Invalid or missing wallet_address for user:", walletAddress);
      return new Response(
        JSON.stringify({
          error: "Invalid or missing wallet_address for user",
          details: walletAddress,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "content-type": "application/json" },
        },
      );
    }

    console.log("✅ User wallet address:", walletAddress);

    // ───────────────────────────────────────────
    // 4) Body du front (TipsterSetupFormData)
    // ───────────────────────────────────────────
    const body = await req.json().catch(() => ({}));
    console.log("📋 Request body:", JSON.stringify(body));

    const {
      monthly_price: monthlyPriceRaw,
      description,
      experience,
      specialties,
      chain = 137,
      name = "Tipster Split Contract",
    }: {
      monthly_price?: string | number;
      description?: string;
      experience?: string;
      specialties?: string[];
      chain?: number | string;
      name?: string;
    } = body;

    // monthly_price arrive maintenant en string -> on convertit
    const monthlyPriceNumber =
      typeof monthlyPriceRaw === "string"
        ? parseFloat(monthlyPriceRaw)
        : typeof monthlyPriceRaw === "number"
        ? monthlyPriceRaw
        : NaN;

    if (
      !Number.isFinite(monthlyPriceNumber) ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      console.error("❌ Invalid payload - monthly_price:", monthlyPriceRaw, "description:", description);
      return new Response(
        JSON.stringify({
          error: "Invalid payload",
          details:
            "monthly_price (string/number convertible en nombre) et description (non-empty string) sont requis",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "content-type": "application/json" },
        },
      );
    }

    // specialties = UUIDs -> map direct sur sport_1_id / 2 / 3
    const specialtiesArray = Array.isArray(specialties) ? specialties : [];
    const [sport_1_id, sport_2_id, sport_3_id] = specialtiesArray;

    console.log("📋 Parsed data:", {
      monthlyPriceNumber,
      description: description.substring(0, 50) + "...",
      experience,
      specialtiesArray,
      chain,
    });

    // ───────────────────────────────────────────
    // 5) Déploiement du Split via thirdweb Engine
    // ───────────────────────────────────────────
    const enginePayload = {
      contractMetadata: {
        name,
        recipients: [
          { address: MASTER_WALLET, sharesBps: 2000 }, // 20%
          { address: walletAddress, sharesBps: 8000 }, // 80%
        ],
      },
    };

    const url = `${ENGINE_URL.replace(/\/+$/, "")}/deploy/${String(chain)}/prebuilts/split`;

    console.log("🚀 Deploying split contract via Engine:", url);
    console.log("📋 Engine payload:", JSON.stringify(enginePayload));

    const engineRes = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "X-Backend-Wallet-Address": BACKEND_WALLET,
      },
      body: JSON.stringify(enginePayload),
    });

    const engineText = await engineRes.text();
    let engineJson: any = null;
    try {
      engineJson = engineText ? JSON.parse(engineText) : null;
    } catch {
      // ignore, on garde engineText brut
    }

    console.log("📋 Engine response status:", engineRes.status);
    console.log("📋 Engine response:", engineText.substring(0, 500));

    if (!engineRes.ok) {
      console.error("❌ Split contract deployment failed:", engineRes.status, engineText);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Split contract deployment failed",
          status: engineRes.status,
          engineResponse: engineJson ?? engineText,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "content-type": "application/json" },
        },
      );
    }

    const result = engineJson?.result ?? {};
    const split_contract_address = result.deployedAddress ?? null;
    const split_queue_id = result.queueId ?? null;

    console.log("✅ Engine result:", { split_contract_address, split_queue_id });

    if (!split_contract_address || !addressRegex.test(split_contract_address)) {
      console.error("❌ Engine did not return a valid deployedAddress:", engineJson);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Engine did not return a valid deployedAddress",
          engineResponse: engineJson,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "content-type": "application/json" },
        },
      );
    }

    // ───────────────────────────────────────────
    // 6) Création du tipster_profile
    // ───────────────────────────────────────────
    console.log("📋 Creating tipster profile...");

    const { data: tipsterProfile, error: profileError } = await supabase
      .from("tipster_profiles")
      .insert({
        user_id: userId,
        monthly_price: monthlyPriceNumber,
        description,
        experience: experience ?? null,
        is_active: true,
        split_contract_address,
        split_queue_id,
        sport_1_id: sport_1_id ?? null,
        sport_2_id: sport_2_id ?? null,
        sport_3_id: sport_3_id ?? null,
      })
      .select("*")
      .single();

    if (profileError) {
      const isUniqueViolation = (profileError as any).code === "23505";
      console.error("❌ Failed to create tipster profile:", profileError.message);

      return new Response(
        JSON.stringify({
          success: false,
          error: isUniqueViolation
            ? "Tipster profile already exists for this user"
            : "Failed to create tipster profile",
          details: profileError.message,
        }),
        {
          status: isUniqueViolation ? 409 : 500,
          headers: { ...corsHeaders, "content-type": "application/json" },
        },
      );
    }

    console.log("✅ Tipster profile created:", tipsterProfile.id);

    // ───────────────────────────────────────────
    // 7) Réponse au front
    // ───────────────────────────────────────────
    return new Response(
      JSON.stringify({
        success: true,
        tipster_profile: tipsterProfile,
        split: {
          contractAddress: split_contract_address,
          queueId: split_queue_id,
          chain,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "content-type": "application/json" },
      },
    );
  } catch (error: unknown) {
    console.error("❌ Unexpected error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Unexpected error in tipster creation",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "content-type": "application/json" },
      },
    );
  }
});
