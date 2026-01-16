import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/ui';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface NetworkErrorPageProps {
  onRetry?: () => void;
  title?: string;
  message?: string;
  showHomeButton?: boolean;
}

export function NetworkErrorPage({ 
  onRetry,
  title = "Connexion perdue",
  message = "Vérifiez votre connexion internet et réessayez.",
  showHomeButton = true
}: NetworkErrorPageProps) {
  const { isOnline, wasOffline, resetWasOffline } = useNetworkStatus();
  const [isRetrying, setIsRetrying] = useState(false);

  // Auto-retry when back online
  useEffect(() => {
    if (isOnline && wasOffline) {
      resetWasOffline();
      handleRetry();
    }
  }, [isOnline, wasOffline, resetWasOffline]);

  const handleRetry = async () => {
    setIsRetrying(true);
    
    if (onRetry) {
      await onRetry();
    } else {
      window.location.reload();
    }
    
    setTimeout(() => setIsRetrying(false), 1000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-background via-background to-destructive/5">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-destructive/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
        {/* Logo with glitch effect */}
        <div className="relative mb-6">
          <img 
            src="/pryzen-logo.png" 
            alt="PRYZEN" 
            className={cn(
              "h-16 w-16 object-contain",
              !isOnline && "animate-pulse opacity-50"
            )}
          />
          
          {/* Status indicator */}
          <div className={cn(
            "absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center",
            isOnline ? "bg-success" : "bg-destructive"
          )}>
            <WifiOff className="w-3 h-3 text-white" />
          </div>
        </div>

        {/* Animated wifi icon */}
        <div className="relative mb-6">
          <WifiOff 
            className={cn(
              "w-16 h-16 text-muted-foreground",
              !isOnline && "animate-pulse"
            )} 
          />
          
          {/* Ripple effect when offline */}
          {!isOnline && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-destructive/30 animate-ping" />
              <div className="absolute inset-2 rounded-full border border-destructive/20 animate-ping animation-delay-200" />
            </>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold mb-3">{title}</h1>
        
        {/* Message */}
        <p className="text-muted-foreground mb-8">{message}</p>

        {/* Status badge */}
        <div className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm mb-6",
          isOnline 
            ? "bg-success/10 text-success" 
            : "bg-destructive/10 text-destructive"
        )}>
          <span className={cn(
            "w-2 h-2 rounded-full",
            isOnline ? "bg-success" : "bg-destructive animate-pulse"
          )} />
          {isOnline ? "Connexion rétablie" : "Hors ligne"}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            size="lg"
            className="flex-1 gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", isRetrying && "animate-spin")} />
            {isRetrying ? "Chargement..." : "Réessayer"}
          </Button>
          
          {showHomeButton && (
            <Button
              asChild
              variant="outline"
              size="lg"
              className="flex-1 gap-2"
            >
              <Link to="/">
                <Home className="w-4 h-4" />
                Accueil
              </Link>
            </Button>
          )}
        </div>

        {/* Help text */}
        <p className="text-xs text-muted-foreground mt-6">
          La page se rechargera automatiquement quand la connexion sera rétablie.
        </p>
      </div>
    </div>
  );
}
