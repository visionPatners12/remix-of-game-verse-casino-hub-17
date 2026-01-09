import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface PublicRouteProps {
  children: React.ReactNode;
  /** Where to redirect authenticated users (default: /dashboard) */
  redirectTo?: string;
}

/**
 * PublicRoute - Redirects authenticated users away from public-only pages
 * Checks onboarding status to redirect appropriately
 */
export function PublicRoute({ children, redirectTo = '/dashboard' }: PublicRouteProps) {
  const { session, isLoading } = useAuth();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    if (!session || isLoading) return;

    const checkOnboarding = async () => {
      try {
        const { data } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .maybeSingle();
        
        setOnboardingCompleted(data?.onboarding_completed ?? false);
      } catch (error) {
        logger.error('Error checking onboarding:', error);
        setOnboardingCompleted(true); // Default to true on error
      }
    };

    checkOnboarding();
  }, [session, isLoading]);

  // Show loading while auth or onboarding check is in progress
  if (isLoading || (session && onboardingCompleted === null)) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // User is authenticated - redirect based on onboarding status
  if (session) {
    const destination = onboardingCompleted ? redirectTo : '/onboarding';
    logger.auth(`PublicRoute: Redirecting to ${destination}`);
    return <Navigate to={destination} replace />;
  }

  // User is not authenticated - show the public content
  return <>{children}</>;
}
