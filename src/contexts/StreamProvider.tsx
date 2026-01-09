import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { connect, StreamClient } from 'getstream';
import { StreamVideoClient } from '@stream-io/video-react-sdk';
import { useAuth } from '@/features/auth';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface StreamContextType {
  client: StreamClient | null;
  videoClient: StreamVideoClient | null;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  getClient: () => StreamClient;
}

const StreamContext = createContext<StreamContextType | undefined>(undefined);

interface StreamProviderProps {
  children: React.ReactNode;
}

/**
 * Unified StreamProvider - manages both GetStream client and StreamVideo client
 * Eliminates redundant API calls by providing a single source of truth
 */
export const StreamProvider: React.FC<StreamProviderProps> = ({ children }) => {
  const { session } = useAuth();
  const [client, setClient] = useState<StreamClient | null>(null);
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Prevent multiple simultaneous calls
  const initializingRef = useRef(false);
  const mountedRef = useRef(true);
  // Ref to track video client for cleanup
  const videoClientRef = useRef<StreamVideoClient | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!session?.user?.id) {
      setClient(null);
      setVideoClient(null);
      setIsReady(false);
      setError(null);
      initializingRef.current = false;
      return;
    }

    // Prevent multiple simultaneous initialization calls
    if (initializingRef.current) {
      logger.debug('🚫 [STREAM] Initialization already in progress, skipping');
      return;
    }

    const initClients = async () => {
      if (initializingRef.current || !mountedRef.current) return;
      
      initializingRef.current = true;
      setIsLoading(true);
      setError(null);
      
      try {
        logger.info('🚀 [STREAM] Starting unified client initialization');
        
        const { data, error: invokeError } = await supabase.functions.invoke('getstream-token');
        
        if (invokeError) throw invokeError;
        
        if (!mountedRef.current || !data?.token || !data?.apiKey || !data?.appId) {
          return;
        }

        // Create standard GetStream client
        const streamClient = connect(data.apiKey, data.token, data.appId);
        
        // Create StreamVideo client
        const streamVideoClient = new StreamVideoClient({
          apiKey: data.apiKey,
          user: {
            id: data.userId || session.user.id,
          },
          token: data.token,
        });
        
        // Store in ref for cleanup
        videoClientRef.current = streamVideoClient;

        if (mountedRef.current) {
          setClient(streamClient);
          setVideoClient(streamVideoClient);
          setIsReady(true);
          logger.info('✅ [STREAM] Both clients initialized successfully');
        }
      } catch (err) {
        if (mountedRef.current) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Stream clients';
          setError(errorMessage);
          logger.error('❌ [STREAM] Client initialization failed:', err);
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
        initializingRef.current = false;
      }
    };

    initClients();

    // Cleanup on unmount or session change
    return () => {
      logger.debug('🧹 [STREAM] Cleaning up clients');
      if (videoClientRef.current) {
        videoClientRef.current.disconnectUser().catch(() => {
          // Silently ignore disconnect errors
        });
        videoClientRef.current = null;
      }
      setClient(null);
      setVideoClient(null);
      setIsReady(false);
    };
  }, [session?.user?.id]);

  // Helper method for backward compatibility
  const getClient = () => {
    if (!isReady || !client) {
      throw new Error('GetStream client not ready. Please ensure user is authenticated.');
    }
    return client;
  };

  const contextValue: StreamContextType = {
    client,
    videoClient,
    isReady,
    isLoading,
    error,
    getClient
  };

  return (
    <StreamContext.Provider value={contextValue}>
      {children}
    </StreamContext.Provider>
  );
};

/**
 * Hook to access GetStream client (standard)
 */
export const useGetStream = () => {
  const context = useContext(StreamContext);
  
  // Return default "not ready" state instead of throwing error
  if (context === undefined) {
    return {
      client: null,
      isReady: false,
      isLoading: false,
      error: 'StreamProvider not found',
      getClient: () => { 
        throw new Error('useGetStream must be used within a StreamProvider'); 
      }
    };
  }

  return {
    client: context.client,
    isReady: context.isReady,
    isLoading: context.isLoading,
    error: context.error,
    getClient: context.getClient
  };
};

/**
 * Hook to access StreamVideo client
 */
export const useStreamVideo = () => {
  const context = useContext(StreamContext);
  
  if (context === undefined) {
    throw new Error('useStreamVideo must be used within a StreamProvider');
  }

  return {
    client: context.videoClient,
    isReady: context.isReady,
    isLoading: context.isLoading,
    error: context.error ? new Error(context.error) : null
  };
};

// Backward compatibility aliases
export const useGetStreamClient = useGetStream;
export const useStreamVideoClient = useStreamVideo;