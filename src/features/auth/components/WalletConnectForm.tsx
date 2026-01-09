
import { useLogin, usePrivy, useIdentityToken, useLogout } from '@privy-io/react-auth';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { logger } from '@/utils/logger';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export const WalletConnectForm = () => {
  const { logout } = useLogout();
  const { ready } = usePrivy();
  const { identityToken } = useIdentityToken();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cachedLoginMethod, setCachedLoginMethod] = useLocalStorage<string | null>('privy_login_method', null);


  const { login } = useLogin({
    onComplete: async ({ loginMethod, loginAccount, user }) => {
      try {
        // Debug logging pour la méthode de connexion
        logger.auth('Login completed with method:', loginMethod);
        logger.auth('Login account details:', loginAccount);
        logger.auth('User details:', user);
        
        // Mise en cache de la méthode de connexion
        setCachedLoginMethod(loginMethod);
        logger.auth('Cached login method:', loginMethod);
        
        logger.auth('🔵 Login completed, waiting for identity token...');
        
        // ✅ Attendre que l'identityToken soit disponible
        let attempts = 0;
        const maxAttempts = 10; // 5 secondes max
        
        while (!identityToken && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 500));
          attempts++;
          logger.auth(`⏳ Waiting for token... ${attempts}/${maxAttempts}`);
        }
        
        if (!identityToken) {
          throw new Error('Identity token not available after 5 seconds');
        }
        
        logger.auth('✅ Got identity token, calling privy-auth...');
        
        // Call privy-auth edge function
        const { data: privyData, error: privyError } = await supabase.functions.invoke('privy-auth', {
          headers: {
            'privy-id-token': identityToken
          },
          body: {
            privyIdToken: identityToken,
            loginMethod,
            loginAccount: JSON.stringify(loginAccount),
            user: JSON.stringify(user)
          }
        });
        
        if (privyError) {
          throw new Error(`Privy auth failed: ${privyError.message}`);
        }
        
        if (!privyData?.success || !privyData?.session_url) {
          throw new Error('Invalid response from Privy auth');
        }
        
        logger.auth('Privy auth response:', {
          success: privyData?.success,
          session_url: privyData?.session_url,
          redirect_url: privyData?.redirect_url,
          needs_onboarding: privyData?.user?.needs_onboarding,
          is_new_user: privyData?.user?.is_new_user
        });
        
        logger.auth('Privy auth successful, redirecting to magic link...');
        
        // Redirect directly to the magic link - Supabase will handle session creation
        // The magic link will automatically create the session and redirect to the final destination
        window.location.href = privyData.session_url;
      } catch (error) {
        logger.error('Wallet connection failed:', error);
        setError(error instanceof Error ? error.message : 'Connection failed');
        setIsConnecting(false);
        try {
          await logout();
        } catch (logoutError) {
          logger.warn('Logout failed:', logoutError);
        }
      }
    },
    onError: (error) => {
      logger.error('Login error:', error);
      setError(typeof error === 'string' ? error : 'Login failed');
      setIsConnecting(false);
    }
  });

  const handleWalletConnect = async () => {
    if (!ready) return;
    
    setIsConnecting(true);
    setError(null);
    
    try {
      logger.auth('Starting wallet connection...');
      
      await login({
        loginMethods: ['email', 'wallet', 'sms'],
        walletChainType: 'ethereum-only',
      });
      
    } catch (error) {
      logger.error('Wallet connection initiation failed:', error);
      setError(error instanceof Error ? error.message : 'Connection failed');
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        disabled={!ready || isConnecting}
        onClick={handleWalletConnect}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-md transition-colors font-medium"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
      
      {error && (
        <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-950/20 p-3 rounded-md border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}
      
      {isConnecting && (
        <div className="text-xs text-center text-muted-foreground">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span>Please approve the connection in your wallet...</span>
          </div>
        </div>
      )}
    </div>
  );
};
