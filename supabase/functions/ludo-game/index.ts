import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

import { LudoHandledError, jsonOk, jsonFail, getBearerToken } from "./lib/http.ts";

import { handleCreate } from "./handlers/create.ts";
import { handleJoin } from "./handlers/join.ts";
import { handleStart } from "./handlers/start.ts";

import { handleRoll } from "./handlers/roll.ts";
import { handleMove } from "./handlers/move.ts";
import { handleSkipAutoPlay } from "./handlers/skip.ts";
import { handleExit } from "./handlers/exit.ts";
import { handleClaimPrize } from "./handlers/claimPrize.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const ep = body?.endpoint ?? body?.action;
    if (!ep) throw new LudoHandledError("BAD_REQUEST", "endpoint is required");

    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = getBearerToken(req);
    if (!token) throw new LudoHandledError("UNAUTHORIZED", "No Authorization header");

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new LudoHandledError("UNAUTHORIZED", "Unauthorized");

    switch (ep) {
      // ✅ Nouveaux endpoints
      case "create":
        return await handleCreate(body, supabase, user);
      case "join":
        return await handleJoin(body, supabase, user);
      case "start":
        return await handleStart(body, supabase, user);

      // ✅ Existants
      case "roll":
        return await handleRoll(body, supabase, user);
      case "move":
        return await handleMove(body, supabase, user);
      case "skip":
      case "autoPlay":
        return await handleSkipAutoPlay(body, supabase, user);
      case "exit":
        return await handleExit(body, supabase, user);
      case "claimPrize":
        return await handleClaimPrize(body, supabase, user);

      default:
        return jsonFail("BAD_REQUEST", "Unknown endpoint");
    }
  } catch (e: any) {
    console.error("Error in ludo-game:", e);

    if (e instanceof LudoHandledError) {
      return jsonFail(e.code, e.message, e.details);
    }

    // IMPORTANT: on renvoie 200 pour éviter le "blank screen" côté client
    return jsonOk({ ok: false, code: "INTERNAL", error: e?.message ?? "Internal error" });
  }
});
