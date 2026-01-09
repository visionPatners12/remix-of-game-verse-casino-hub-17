import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { AuthUser, AuthSession, UserType, isValidSession } from '../types';

/**
 * Simplified auth session hook following KISS principles
 * Fixed to prevent race conditions during initialization
 */
export function useAuthSession() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Track if initial session check is complete to prevent race conditions
  const isInitializedRef = useRef(false);

  // Simplified userType determination without caching
  const getUserType = (user: AuthUser | null): UserType => {
    if (!user) return 'none';
    
    const metadata = user.user_metadata;
    const authMethod = metadata?.auth_method;
    const privyUserId = metadata?.privy_user_id;
    
    return (authMethod === 'wallet' || privyUserId) ? 'privy' : 'supabase';
  };

  const userType = getUserType(user);

  // Handle PWA bfcache restoration (iOS Safari)
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        logger.auth('📱 PWA restored from bfcache, refreshing session...');
        supabase.auth.getSession().then(({ data: { session: refreshedSession } }) => {
          if (refreshedSession) {
            setSession(refreshedSession as AuthSession);
            setUser(refreshedSession.user as AuthUser);
            logger.auth('✅ Session refreshed after bfcache restore');
          }
        });
      }
    };
    
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  useEffect(() => {
    let mounted = true;
    
    logger.auth('🔄 Auth session hook initializing...');
    
    // 1. Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mounted) return;
        
        logger.auth(`📡 Auth state change: ${event}`, { 
          hasSession: !!newSession, 
          userId: newSession?.user?.id,
          isInitialized: isInitializedRef.current
        });
        
        // Always update state on auth events after initialization
        // Or on SIGNED_IN event (magic link callback)
        if (isInitializedRef.current || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (isValidSession(newSession)) {
            setSession(newSession as AuthSession);
            setUser(newSession.user as AuthUser);
            logger.auth('✅ Session updated via auth event');
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setSession(null);
            logger.auth('🚪 Session cleared via auth event');
          }
          setIsLoading(false);
        }
      }
    );

    // 2. Check for existing session
    const initSession = async () => {
      try {
        // Detect magic link in URL hash
        const hash = window.location.hash;
        const isMagicLink = hash.includes('access_token') || hash.includes('refresh_token');
        
        if (isMagicLink) {
          logger.auth('🔗 Magic link detected, letting auth listener handle it...');
          // Magic link will be processed by onAuthStateChange
          // Just mark as initialized and let the listener handle the rest
          isInitializedRef.current = true;
          // Don't set loading to false yet - wait for auth event
          return;
        }
        
        logger.auth('🔍 Checking for existing session...');
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          logger.auth('❌ Session check error:', error);
          setUser(null);
          setSession(null);
        } else if (isValidSession(initialSession)) {
          logger.auth('✅ Valid session found', { userId: initialSession.user.id });
          setSession(initialSession as AuthSession);
          setUser(initialSession.user as AuthUser);
        } else {
          logger.auth('ℹ️ No valid session found');
          setUser(null);
          setSession(null);
        }
        
        isInitializedRef.current = true;
        setIsLoading(false);
      } catch (error) {
        logger.auth('❌ Session init failed:', error);
        if (mounted) {
          setUser(null);
          setSession(null);
          isInitializedRef.current = true;
          setIsLoading(false);
        }
      }
    };

    initSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Direct computed auth states without memoization
  const isAuthenticated = user !== null && session !== null;

  return {
    user,
    session,
    isLoading,
    userType,
    isAuthenticated,
    isEmailPasswordUser: userType === 'supabase',
    isWalletUser: userType === 'privy',
    isFullyAuthenticated: isAuthenticated && !isLoading
  };
}