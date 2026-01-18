import React, { createContext, useContext } from 'react';
import { AuthContextType } from '../types';
import { useAuthSession } from '../hooks/useAuthSession';
import { useAuthActions } from '../hooks/useAuthActions';
import { useSyncSafeAddress } from '@/hooks/useSyncSafeAddress';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Simplified AuthProvider following KISS principles
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const sessionState = useAuthSession();
  const actions = useAuthActions();
  
  // Sync Safe address to database when available
  useSyncSafeAddress();

  // Direct context value without memoization for simplicity
  const value: AuthContextType = {
    ...sessionState,
    ...actions
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}