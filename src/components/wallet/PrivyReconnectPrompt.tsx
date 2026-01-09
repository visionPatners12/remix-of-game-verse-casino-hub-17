import { useState, useEffect, useCallback } from 'react';
import { usePrivyPersistence } from '@/hooks/usePrivyPersistence';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function PrivyReconnectPrompt() {
  const { needsReconnection, reconnectPrivy, isPrivyReady, autoReconnectFailed } = usePrivyPersistence();
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const handleReconnect = useCallback(async () => {
    if (isReconnecting || !isPrivyReady) return;
    
    setIsReconnecting(true);
    try {
      await reconnectPrivy();
    } finally {
      setIsReconnecting(false);
    }
  }, [isReconnecting, isPrivyReady, reconnectPrivy]);

  // Auto-retry reconnection when app regains focus (PWA resume)
  useEffect(() => {
    const handleFocus = () => {
      if (needsReconnection && isPrivyReady && !isReconnecting && !dismissed && autoReconnectFailed) {
        handleReconnect();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [needsReconnection, isPrivyReady, isReconnecting, dismissed, autoReconnectFailed, handleReconnect]);

  // Only show prompt if auto-reconnect was attempted and failed
  if (!needsReconnection || dismissed || !autoReconnectFailed) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-4">
      <Card className="bg-amber-500/10 border-amber-500/30 shadow-lg backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">Wallet session expired</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your wallet connection has expired. Reconnect to use wallet features.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={() => setDismissed(true)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              onClick={handleReconnect}
              disabled={isReconnecting || !isPrivyReady}
              className="flex-1"
            >
              {isReconnecting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Reconnecting...
                </>
              ) : (
                'Reconnect Wallet'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
