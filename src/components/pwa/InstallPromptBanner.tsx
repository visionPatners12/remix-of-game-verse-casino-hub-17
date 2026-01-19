import { useState } from 'react';
import { X, Download, Share, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { motion, AnimatePresence } from 'framer-motion';

export function InstallPromptBanner() {
  const { canInstall, isIOS, promptInstall, dismissPrompt, isInstalled } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(true);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  if (!canInstall || !isVisible || isInstalled) {
    return null;
  }

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
    } else {
      const installed = await promptInstall();
      if (installed) {
        setIsVisible(false);
      }
    }
  };

  const handleDismiss = () => {
    dismissPrompt();
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-20 left-4 right-4 z-50 md:bottom-4 md:left-auto md:right-4 md:max-w-sm"
        >
          <div className="bg-card border border-border rounded-2xl p-4 shadow-xl">
            {!showIOSInstructions ? (
              <>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                    <Download className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm">
                      Install PRYZEN
                    </h3>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      Quick access from your home screen
                    </p>
                  </div>
                  <button
                    onClick={handleDismiss}
                    className="flex-shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    className="flex-1 text-xs"
                  >
                    Later
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleInstall}
                    className="flex-1 text-xs bg-primary hover:bg-primary-hover"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Install
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground text-sm">
                    Install on iOS
                  </h3>
                  <button
                    onClick={() => setShowIOSInstructions(false)}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                      <Share className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Tap <span className="text-foreground font-medium">Share</span> at the bottom of Safari
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                      <Plus className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Select <span className="text-foreground font-medium">"Add to Home Screen"</span>
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDismiss}
                  className="w-full mt-4 text-xs"
                >
                  Got it
                </Button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
