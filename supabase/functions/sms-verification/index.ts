import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const PRELUDE_BASE = "https://api.prelude.dev/v2";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const preludeApiKey = Deno.env.get("PRELUDE_API_KEY");

    if (!preludeApiKey) {
      return json({ success: false, message: "Clé API Prelude manquante" }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { action, phone, code, dispatch_id, metadata, signals } = await req.json().catch(() => ({}));

    console.log("🚀 [SMS-VERIFICATION] Nouvelle requête:", {
      action,
      phone: phone ? `***${phone.slice(-4)}` : null, // Masque le numéro pour la sécurité
      code_provided: !!code,
      dispatch_id,
      metadata,
      signals: signals ? {
        ...signals,
        ip: signals.ip ? `***${signals.ip.split('.').pop()}` : null,
        device_id: signals.device_id ? `***${signals.device_id.slice(-6)}` : null,
        user_agent: signals.user_agent ? `${signals.user_agent.substring(0, 50)}...` : null
      } : null,
      has_auth_header: !!req.headers.get("Authorization")
    });

    if (!action) return json({ success: false, message: "Paramètre 'action' requis" }, 400);
    if (!phone) return json({ success: false, message: "Paramètre 'phone' requis" }, 400);

    // Format phone number to E.164
    function formatPhoneNumber(phoneNumber: string): string {
      const cleaned = phoneNumber.replace(/\D/g, '');
      
      if (cleaned.startsWith('0')) {
        return '+33' + cleaned.slice(1);
      }
      
      if (!cleaned.startsWith('33') && !phoneNumber.startsWith('+')) {
        return '+33' + cleaned;
      }
      
      if (cleaned.startsWith('33')) {
        return '+' + cleaned;
      }
      
      return phoneNumber;
    }

    const formattedPhone = formatPhoneNumber(phone);

    // 1) ENVOI / RETRY DU CODE
    if (action === "send") {
      const payload: Record<string, unknown> = {
        target: { type: "phone_number", value: formattedPhone },
      };
      if (dispatch_id) payload.dispatch_id = dispatch_id;
      if (metadata) payload.metadata = metadata;
      if (signals) payload.signals = signals;

      console.log("🔍 [PRELUDE SEND] Requête:", {
        url: `${PRELUDE_BASE}/verification`,
        phone_original: phone,
        phone_formatted: formattedPhone,
        payload,
        api_key_present: !!preludeApiKey,
        api_key_length: preludeApiKey?.length || 0
      });

      const res = await fetch(`${PRELUDE_BASE}/verification`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${preludeApiKey}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => ({}));

      console.log("📥 [PRELUDE SEND] Réponse:", {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        headers: Object.fromEntries(res.headers.entries()),
        body
      });

      if (res.ok) {
        console.log("✅ [PRELUDE SEND] Succès - Code envoyé");
        
        // Enhanced response with all Prelude API fields
        const response = {
          success: true,
          message: body.status === 'blocked' 
            ? `Vérification bloquée: ${body.reason || 'Raison inconnue'}`
            : body.status === 'retry'
            ? "Code renvoyé (tentative précédente)"
            : body.method === 'voice'
            ? "Code envoyé par appel vocal"
            : body.method === 'silent'
            ? "Vérification silencieuse disponible"
            : "Code SMS envoyé",
          // Prelude API response fields
          id: body.id,
          status: body.status,
          method: body.method,
          reason: body.reason,
          channels: body.channels,
          silent: body.silent,
          metadata: body.metadata,
          request_id: body.request_id,
          // Legacy compatibility fields
          verification_id: body.id,
          silent_request_url: body?.silent?.request_url ?? null,
        };
        
        return json(response);
      } else {
        console.error("❌ [PRELUDE SEND] Erreur:", {
          status: res.status,
          error_code: body?.code,
          error_message: body?.message,
          full_response: body
        });
        return json(
          {
            success: false,
            message: body?.message ?? "Échec de l'envoi du code",
            code: body?.code ?? "unknown_error",
            status: body?.status,
            reason: body?.reason,
            request_id: body?.request_id,
          },
          res.status,
        );
      }
    }

    // 2) VÉRIFICATION DU CODE
    if (action === "verify") {
      if (!code) return json({ success: false, message: "Paramètre 'code' requis" }, 400);

      console.log("🔍 [PRELUDE VERIFY] Requête:", {
        url: `${PRELUDE_BASE}/verification/check`,
        phone_original: phone,
        phone_formatted: formattedPhone,
        code: `***${code.slice(-2)}`, // Masque le code pour la sécurité
        api_key_present: !!preludeApiKey
      });

      const res = await fetch(`${PRELUDE_BASE}/verification/check`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${preludeApiKey}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target: { type: "phone_number", value: formattedPhone },
          code,
        }),
      });

      const body = await res.json().catch(() => ({}));

      console.log("📥 [PRELUDE VERIFY] Réponse:", {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        body
      });

      if (res.ok && body?.status === "success") {
        console.log("✅ [PRELUDE VERIFY] Succès - Code vérifié");
        // On met à jour phone_verified côté DB pour l'utilisateur authentifié
        const authHeader = req.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return json({ success: false, message: "Non autorisé" }, 401);
        }
        const jwt = authHeader.replace("Bearer ", "").trim();
        const { data: userData } = await supabase.auth.getUser(jwt);
        const user = userData?.user;
        if (!user) return json({ success: false, message: "Utilisateur non trouvé" }, 404);

        const { error } = await supabase.from("users").update({ phone_verified: true }).eq("id", user.id);
        if (error) {
          console.error("DB update error:", error);
          return json({ success: false, message: "Erreur lors de la mise à jour" }, 500);
        }

        return json({
          success: true,
          message: "Téléphone vérifié avec succès",
          verified: true,
          // Prelude API response fields
          id: body.id,
          status: body.status,
          method: body.method,
          metadata: body.metadata,
          request_id: body.request_id,
          // Legacy compatibility
          verification_id: body.id,
        });
      } else {
        console.error("❌ [PRELUDE VERIFY] Erreur:", {
          status: res.status,
          error_code: body?.code,
          error_message: body?.message,
          full_response: body
        });
        return json(
          {
            success: false,
            message: body?.message ?? "Code invalide ou expiré",
            code: body?.code ?? "verification_failed",
            status: body?.status,
            reason: body?.reason,
            request_id: body?.request_id,
          },
          res.status || 400,
        );
      }
    }

    return json({ success: false, message: "Action non reconnue" }, 400);
  } catch (err) {
    console.error("Prelude verify error:", err);
    return json({ success: false, message: "Erreur interne du serveur" }, 500);
  }
});