import { WifiOff } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { motion, AnimatePresence } from 'framer-motion';

export function OfflineIndicator() {
  const { isOnline } = useNetworkStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-warning text-warning-foreground"
        >
          <div className="flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium">
            <WifiOff className="w-4 h-4" />
            <span>Vous êtes hors ligne</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
