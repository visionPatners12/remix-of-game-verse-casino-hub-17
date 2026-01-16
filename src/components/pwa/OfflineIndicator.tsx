import { WifiOff, RefreshCw, Wifi } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/ui';

export function OfflineIndicator() {
  const { isOnline, wasOffline, resetWasOffline } = useNetworkStatus();

  const handleRetry = () => {
    window.location.reload();
  };

  const handleDismiss = () => {
    resetWasOffline();
  };

  return (
    <AnimatePresence>
      {/* Offline indicator */}
      {!isOnline && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-destructive text-destructive-foreground"
        >
          <div className="flex items-center justify-between gap-2 py-2.5 px-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <WifiOff className="w-4 h-4 animate-pulse" />
              <span>Vous êtes hors ligne</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetry}
              className="h-7 px-2 text-xs bg-white/10 hover:bg-white/20"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Réessayer
            </Button>
          </div>
        </motion.div>
      )}

      {/* Back online notification */}
      {isOnline && wasOffline && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-success text-success-foreground"
        >
          <div className="flex items-center justify-between gap-2 py-2.5 px-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Wifi className="w-4 h-4" />
              <span>Connexion rétablie</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-7 px-2 text-xs bg-white/10 hover:bg-white/20"
            >
              Fermer
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
