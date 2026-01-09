import React from 'react';
import { useAuth } from '@/features/auth';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export const SessionDebug = () => {
  const { user, session, isLoading, isAuthenticated } = useAuth();

  const handleForceSessionRefresh = async () => {
    try {
      logger.auth('Forcing session refresh...');
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        logger.error('Session refresh failed:', error);
      } else {
        logger.auth('Session refreshed successfully:', data);
      }
    } catch (error) {
      logger.error('Failed to refresh session:', error);
    }
  };

  const handleTestDbConnection = async () => {
    try {
      logger.auth('Testing database connection...');
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        logger.error('Get session failed:', error);
        return;
      }
      
      if (!data.session) {
        logger.error('No session found');
        return;
      }

      // Test a simple query to see if auth.uid() works
      const { data: testData, error: testError } = await supabase
        .from('user_preferences')
        .select('count(*)')
        .limit(1);
        
      if (testError) {
        logger.error('Database test failed:', testError);
      } else {
        logger.auth('Database test successful:', testData);
      }
    } catch (error) {
      logger.error('Database test error:', error);
    }
  };

  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    return (
      <div className="fixed bottom-4 right-4 bg-card border rounded-lg p-4 shadow-lg max-w-sm text-xs z-50">
        <h3 className="font-bold mb-2 text-primary">Session Debug</h3>
        <div className="space-y-1 text-muted-foreground">
          <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
          <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
          <div>User ID: {user?.id || 'None'}</div>
          <div>Session: {session ? 'Present' : 'None'}</div>
          <div>Auth Method: {user?.user_metadata?.auth_method || 'Unknown'}</div>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleForceSessionRefresh}
            className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs hover:bg-primary/90"
          >
            Refresh
          </button>
          <button
            onClick={handleTestDbConnection}
            className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs hover:bg-secondary/90"
          >
            Test DB
          </button>
        </div>
      </div>
    );
  }

  return null;
};