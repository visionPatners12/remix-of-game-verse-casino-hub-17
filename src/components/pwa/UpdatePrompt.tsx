import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAUpdate } from '@/hooks/usePWAUpdate';
import { motion, AnimatePresence } from 'framer-motion';

export function UpdatePrompt() {
  const { needRefresh, updateServiceWorker, close } = usePWAUpdate();

  if (!needRefresh) {
    return null;
  }

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm"
        >
          <div className="bg-card border border-border rounded-2xl p-4 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary to-primary/80">
                <RefreshCw className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm">
                  Mise à jour disponible
                </h3>
                <p className="text-muted-foreground text-xs mt-0.5">
                  Une nouvelle version de PRYZEN est disponible
                </p>
              </div>
              <button
                onClick={close}
                className="flex-shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex gap-2 mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={close}
                className="flex-1 text-xs"
              >
                Plus tard
              </Button>
              <Button
                size="sm"
                onClick={updateServiceWorker}
                className="flex-1 text-xs bg-primary hover:bg-primary-hover"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Mettre à jour
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
