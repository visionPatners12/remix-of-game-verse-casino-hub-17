import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TokenConfirmationForm } from '@/features/auth/components/TokenConfirmationForm';
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function TokenConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (!emailParam) {
      // Rediriger vers l'inscription si pas d'email
      navigate('/auth');
      return;
    }
    setEmail(emailParam);
  }, [searchParams, navigate]);

  const handleResendToken = async () => {
    // Logique pour renvoyer le token
    await supabase.auth.resend({
      type: 'signup',
      email: email,
    });
  };

  const logoUrl = "/pryzen-logo.png";

  if (isMobile) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900 flex flex-col overflow-hidden safe-area-top">
        {/* Header mobile */}
        <div className="flex items-center justify-between p-4 border-b border-border/20">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/auth')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div className="text-center">
            <img 
              src={logoUrl} 
              alt="PRYZEN"
              className="h-8 object-contain mx-auto" 
            />
          </div>
          <div className="w-16" />
        </div>

        {/* Contenu principal mobile */}
        <div className="flex-1 flex flex-col justify-center px-6 py-8">
          <div className="max-w-sm mx-auto w-full">
            <TokenConfirmationForm 
              email={email} 
              onResendToken={handleResendToken}
            />
          </div>
        </div>

        {/* Footer mobile */}
        <div className="text-center pb-8 pt-4">
          <p className="text-xs text-slate-400 leading-relaxed px-6 max-w-xs mx-auto">
            En confirmant votre email, vous acceptez nos{" "}
            <a href="#" className="text-purple-400 hover:text-purple-300 underline transition-colors">
              conditions d'utilisation
            </a>
          </p>
        </div>
      </div>
    );
  }

  // Version desktop
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Card desktop */}
        <div className="bg-slate-800/95 backdrop-blur-xl border border-purple-500/20 shadow-2xl rounded-2xl p-8">
          {/* Header avec logo */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <img 
                src={logoUrl} 
                alt="PRYZEN" 
                className="h-8 object-contain" 
              />
              <span className="text-xl font-bold text-white">Pryzen</span>
            </div>
            <Button 
              variant="ghost"
              onClick={() => navigate('/auth')}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>

          {/* Formulaire de confirmation */}
          <TokenConfirmationForm 
            email={email} 
            onResendToken={handleResendToken}
          />
        </div>

        {/* Footer desktop */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-400 leading-relaxed">
            En confirmant votre email, vous acceptez nos{" "}
            <a href="#" className="text-purple-400 hover:text-purple-300 hover:underline transition-colors">
              conditions d'utilisation
            </a>{" "}
            et notre{" "}
            <a href="#" className="text-purple-400 hover:text-purple-300 hover:underline transition-colors">
              politique de confidentialité
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
