import React, { memo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ExternalProviders } from './ExternalProviders';
import { useAuthPersistence } from '@/hooks/useAuthPersistence';
import { FullscreenProvider } from '@/contexts/FullscreenContext';
import { PrivyReconnectPrompt } from '@/components/wallet/PrivyReconnectPrompt';
import { useGlobalActiveGameRedirect } from '@/features/ludo/hooks/useGlobalActiveGameRedirect';
import { useSyncSafeAddress } from '@/hooks/useSyncSafeAddress';

const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Something went wrong!</h1>
      <p className="text-muted-foreground">Please refresh the page</p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        Refresh
      </button>
    </div>
  </div>
);

const AuthInitializer = memo(({ children }: { children: React.ReactNode }) => {
  useAuthPersistence();
  useGlobalActiveGameRedirect();
  useSyncSafeAddress();
  
  return (
    <>
      {children}
      <PrivyReconnectPrompt />
    </>
  );
});

interface AppProviderProps {
  children: React.ReactNode;
}

/**
 * Main application provider - Optimized for Ludo gaming
 * Handles error boundaries, external providers, and app initialization
 */
export const AppProvider = memo(({ children }: AppProviderProps) => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <ExternalProviders>
      <FullscreenProvider>
        <AuthInitializer>
          {children}
        </AuthInitializer>
      </FullscreenProvider>
    </ExternalProviders>
  </ErrorBoundary>
));

AppProvider.displayName = 'AppProvider';
