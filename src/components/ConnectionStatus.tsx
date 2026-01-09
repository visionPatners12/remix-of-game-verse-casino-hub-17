
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/ui';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

export const ConnectionStatus = () => {
  const { isAuthenticated, refreshSession } = useAuth();
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Monitor internet connection status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Connection restored",
        description: "You are back online",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Connection lost",
        description: "Check your internet connection",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Function to force a refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      if (isAuthenticated) {
        await refreshSession();
        toast({
          title: "Session refreshed",
          description: "Your data has been synchronized",
        });
      } else {
        // Simply reload the page if not authenticated
        window.location.reload();
      }
    } catch (error) {
      logger.error('Refresh error:', error);
      toast({
        title: "Sync error",
        description: "Unable to refresh data",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Don't display if everything is fine
  if (isOnline && isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed top-2 right-2 z-50 flex items-center gap-2 bg-background/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-lg">
      <div className="flex items-center gap-2">
        {isOnline ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-500" />
        )}
        
        <span className="text-sm text-muted-foreground">
          {!isOnline ? "Offline" : "Disconnected"}
        </span>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="h-6 px-2"
      >
        <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
};
