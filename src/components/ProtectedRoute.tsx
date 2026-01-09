
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { logger } from '@/utils/logger';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, isLoading } = useAuth();

  logger.debug('ProtectedRoute state:', { 
    hasSession: !!session, 
    isLoading
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    logger.auth('No session, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
