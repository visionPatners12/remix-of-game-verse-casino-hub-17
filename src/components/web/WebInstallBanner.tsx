import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InstallAppModal } from './InstallAppModal';

const BANNER_DISMISSED_KEY = 'web-install-banner-dismissed';
const DISMISS_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface WebInstallBannerProps {
  className?: string;
}

/**
 * A sticky bottom banner encouraging app installation.
 * Only shows on mobile web for non-authenticated users who don't have the PWA installed.
 */
export function WebInstallBanner({ className }: WebInstallBannerProps) {
  const { authenticated } = usePrivy();
  const { isInstalled } = usePWAInstall();
  const isMobile = useIsMobile();
  const [isDismissed, setIsDismissed] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Check if banner was recently dismissed
  useEffect(() => {
    const dismissedAt = localStorage.getItem(BANNER_DISMISSED_KEY);
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      if (Date.now() - dismissedTime < DISMISS_DURATION) {
        setIsDismissed(true);
        return;
      }
      localStorage.removeItem(BANNER_DISMISSED_KEY);
    }
    setIsDismissed(false);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(BANNER_DISMISSED_KEY, Date.now().toString());
    setIsDismissed(true);
  };

  const handleInstallClick = () => {
    setShowModal(true);
  };

  // Don't show if:
  // - User is authenticated
  // - PWA is already installed
  // - Not on mobile
  // - Banner was dismissed
  if (authenticated || isInstalled || !isMobile || isDismissed) {
    return null;
  }

  return (
    <>
      <div 
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50",
          "bg-gradient-to-r from-primary/95 to-primary",
          "backdrop-blur-sm border-t border-primary-foreground/10",
          "px-4 py-3",
          "safe-area-bottom",
          className
        )}
      >
        <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
          {/* Icon and text */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
              <Smartphone className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-primary-foreground truncate">
                Get the full experience
              </p>
              <p className="text-xs text-primary-foreground/80 truncate">
                Install PRYZEN for free
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="secondary"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold px-4"
              onClick={handleInstallClick}
            >
              <Download className="h-4 w-4 mr-1.5" />
              Install
            </Button>
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-full hover:bg-primary-foreground/20 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4 text-primary-foreground/80" />
            </button>
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from being hidden behind the banner */}
      <div className="h-20" />

      <InstallAppModal
        open={showModal}
        onOpenChange={setShowModal}
      />
    </>
  );
}
