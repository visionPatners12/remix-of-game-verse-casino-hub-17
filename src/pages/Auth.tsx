import { useAuth } from "@/features/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logger } from '@/utils/logger';
import { supabase } from "@/integrations/supabase/client";
import { AuthFlow } from "@/features/auth/components/AuthFlow";

export default function Auth() {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    // Wait for auth to be initialized
    if (isLoading) {
      logger.auth('⏳ Auth page: waiting for auth initialization...');
      return;
    }
    
    // No session - stay on auth page
    if (!session) {
      logger.auth('ℹ️ Auth page: no session, showing login');
      return;
    }

    // Already redirecting - prevent duplicate redirects
    if (isRedirecting) return;

    const checkOnboardingStatus = async () => {
      setIsRedirecting(true);
      logger.auth('🔍 Session detected, checking onboarding status...');
      
      try {
        const { data } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .maybeSingle();

        const destination = data?.onboarding_completed ? '/dashboard' : '/onboarding';
        logger.auth(`✅ Redirecting to ${destination}`);
        navigate(destination, { replace: true });
      } catch (error) {
        logger.auth('❌ Error checking onboarding status:', error);
        // Default to dashboard on error
        navigate('/dashboard', { replace: true });
      }
    };

    checkOnboardingStatus();
  }, [session, isLoading, navigate, isRedirecting]);

  const logoUrl = "/pryzen-logo.png";

  // Show loading spinner while auth is initializing or redirecting
  if (isLoading || isRedirecting) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">
            {isRedirecting ? 'Redirecting...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return <AuthFlow logoUrl={logoUrl} />;
}
