import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { encode, decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

// Utilitaires de hachage avec Web Crypto API
const hashPin = async (pin: string, salt?: string): Promise<string> => {
  const encoder = new TextEncoder();
  const actualSalt = salt || crypto.getRandomValues(new Uint8Array(16));
  const saltString = typeof actualSalt === 'string' ? actualSalt : Array.from(actualSalt, b => b.toString(16).padStart(2, '0')).join('');
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(pin),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(saltString),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  
  const hashArray = Array.from(new Uint8Array(derivedBits));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `${saltString}:${hashHex}`;
};

const verifyPin = async (pin: string, hashedPin: string): Promise<boolean> => {
  const [salt, hash] = hashedPin.split(':');
  if (!salt || !hash) return false;
  
  const newHash = await hashPin(pin, salt);
  return newHash === hashedPin;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const json = (data: any, status = 200) => 
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });

// Simple JWT-like token creation (in production, use proper JWT library)
const createToken = (userId: string, durationMinutes: number = 5): string => {
  const payload = {
    userId,
    exp: Date.now() + (durationMinutes * 60 * 1000),
    type: 'pin_session'
  };
  return btoa(JSON.stringify(payload));
};

const verifyToken = (token: string): { userId: string; exp: number } | null => {
  try {
    const payload = JSON.parse(atob(token));
    if (payload.type !== 'pin_session' || payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ success: false, message: "Token d'authentification requis" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("❌ [PIN-VERIFICATION] Auth error:", authError);
      return json({ success: false, message: "Utilisateur non authentifié" }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const { action, pin, current_pin, session_token } = body;

    console.log("🚀 [PIN-VERIFICATION] Nouvelle requête:", {
      action,
      user_id: user.id,
      has_pin: !!pin,
      has_current_pin: !!current_pin
    });

    if (!action) {
      return json({ success: false, message: "Paramètre 'action' requis" }, 400);
    }

    // CRÉATION/MODIFICATION DU PIN
    if (action === 'set') {
      if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
        return json({ success: false, message: "Le PIN doit contenir exactement 6 chiffres" }, 400);
      }

      // Si un current_pin est fourni, on vérifie d'abord l'ancien PIN
      if (current_pin) {
        const { data: existingPin } = await supabase
          .from('user_pin')
          .select('hashed_pin, failed_attempts, locked_until')
          .eq('user_id', user.id)
          .single();

        if (!existingPin?.hashed_pin) {
          return json({ success: false, message: "Aucun PIN existant trouvé" }, 400);
        }

        // Vérifier si le compte est verrouillé
        if (existingPin.locked_until && new Date(existingPin.locked_until) > new Date()) {
          return json({ success: false, message: "Compte temporairement verrouillé" }, 423);
        }

        // Vérifier l'ancien PIN
        const isCurrentPinValid = await verifyPin(current_pin, existingPin.hashed_pin);
        if (!isCurrentPinValid) {
          // Incrémenter les tentatives échouées
          const newFailedAttempts = (existingPin.failed_attempts || 0) + 1;
          const lockUntil = newFailedAttempts >= 3 
            ? new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
            : null;

          await supabase
            .from('user_pin')
            .update({ 
              failed_attempts: newFailedAttempts,
              locked_until: lockUntil 
            })
            .eq('user_id', user.id);

          return json({ 
            success: false, 
            message: newFailedAttempts >= 3 
              ? "Trop de tentatives échouées. Compte verrouillé 5 minutes."
              : `PIN incorrect. ${3 - newFailedAttempts} tentative(s) restante(s).`
          }, 400);
        }
      }

      // Hasher le nouveau PIN
      const hashedPin = await hashPin(pin);

      // Sauvegarder le PIN
      const { error: saveError } = await supabase
        .from('user_pin')
        .upsert({
          user_id: user.id,
          hashed_pin: hashedPin,
          pin_enabled: true,
          failed_attempts: 0,
          locked_until: null
        });

      if (saveError) {
        console.error("❌ [PIN-VERIFICATION] Error saving PIN:", saveError);
        return json({ success: false, message: "Erreur lors de la sauvegarde du PIN" }, 500);
      }

      console.log("✅ [PIN-VERIFICATION] PIN set successfully");
      return json({ success: true, message: "PIN configuré avec succès" });
    }

    // VÉRIFICATION DU PIN
    if (action === 'verify') {
      if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
        return json({ success: false, message: "PIN invalide" }, 400);
      }

      // Récupérer le PIN de l'utilisateur
      const { data: userPin, error: fetchError } = await supabase
        .from('user_pin')
        .select('hashed_pin, pin_enabled, failed_attempts, locked_until')
        .eq('user_id', user.id)
        .single();

      if (fetchError || !userPin?.hashed_pin) {
        console.error("❌ [PIN-VERIFICATION] No PIN found for user:", user.id);
        return json({ success: false, message: "Aucun PIN configuré" }, 404);
      }

      if (!userPin.pin_enabled) {
        return json({ success: false, message: "PIN désactivé" }, 403);
      }

      // Vérifier si le compte est verrouillé
      if (userPin.locked_until && new Date(userPin.locked_until) > new Date()) {
        const lockTimeLeft = Math.ceil((new Date(userPin.locked_until).getTime() - Date.now()) / (1000 * 60));
        return json({ 
          success: false, 
          message: `Compte verrouillé. Réessayez dans ${lockTimeLeft} minute(s).`,
          locked_until: userPin.locked_until
        }, 423);
      }

      // Vérifier le PIN
      const isPinValid = await verifyPin(pin, userPin.hashed_pin);

      if (isPinValid) {
        // PIN valide - réinitialiser les tentatives et mettre à jour last_used_at
        await supabase
          .from('user_pin')
          .update({ 
            failed_attempts: 0,
            locked_until: null,
            last_used_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        // Générer un token de session
        const sessionToken = createToken(user.id, 5); // 5 minutes pour les paiements

        console.log("✅ [PIN-VERIFICATION] PIN verified successfully");
        return json({ 
          success: true, 
          valid: true,
          session_token: sessionToken,
          expires_in: 5 * 60 // 5 minutes en secondes
        });
      } else {
        // PIN invalide - incrémenter les tentatives
        const newFailedAttempts = (userPin.failed_attempts || 0) + 1;
        const lockUntil = newFailedAttempts >= 3 
          ? new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
          : null;

        await supabase
          .from('user_pin')
          .update({ 
            failed_attempts: newFailedAttempts,
            locked_until: lockUntil 
          })
          .eq('user_id', user.id);

        console.log("❌ [PIN-VERIFICATION] Invalid PIN, attempts:", newFailedAttempts);
        return json({ 
          success: false, 
          valid: false,
          message: newFailedAttempts >= 3 
            ? "Trop de tentatives échouées. Compte verrouillé 5 minutes."
            : `PIN incorrect. ${3 - newFailedAttempts} tentative(s) restante(s).`,
          attempts_left: Math.max(0, 3 - newFailedAttempts)
        });
      }
    }

    // VALIDATION D'UN TOKEN DE SESSION
    if (action === 'validate_token') {
      if (!session_token) {
        return json({ success: false, message: "Token de session requis" }, 400);
      }

      const tokenData = verifyToken(session_token);
      if (!tokenData || tokenData.userId !== user.id) {
        return json({ success: false, valid: false, message: "Token invalide ou expiré" });
      }

      console.log("✅ [PIN-VERIFICATION] Session token validated");
      return json({ 
        success: true, 
        valid: true,
        expires_in: Math.max(0, Math.floor((tokenData.exp - Date.now()) / 1000))
      });
    }

    return json({ success: false, message: "Action non reconnue" }, 400);

  } catch (error) {
    console.error("❌ [PIN-VERIFICATION] Unexpected error:", error);
    return json({ 
      success: false, 
      message: "Erreur interne du serveur" 
    }, 500);
  }
});