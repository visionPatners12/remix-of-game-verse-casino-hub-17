import { useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Apple, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import '@khmyznikov/pwa-install';

interface PWAInstallButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  platform?: "ios" | "android" | "both";
  className?: string;
}

// PRYZEN brand color - only --tint-color is supported by pwa-install
const pwaInstallStyles = JSON.stringify({
  '--tint-color': '#8B5CF6'
});

export function PWAInstallButton({ 
  variant = "default", 
  size = "default", 
  platform = "both",
  className 
}: PWAInstallButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Setup event listeners for PWA install events
  useEffect(() => {
    const pwaElement = containerRef.current?.querySelector('pwa-install');
    if (!pwaElement) return;

    const handleSuccess = () => {
      toast.success('PRYZEN installed successfully!', {
        description: 'You can now access the app from your home screen.'
      });
    };

    const handleUserChoice = (event: Event) => {
      const customEvent = event as PWAUserChoiceResultEvent;
      if (customEvent.detail?.message === 'dismissed') {
        toast.info('Installation cancelled', {
          description: 'You can install PRYZEN anytime from the download buttons.'
        });
      }
    };

    pwaElement.addEventListener('pwa-install-success-event', handleSuccess);
    pwaElement.addEventListener('pwa-user-choice-result-event', handleUserChoice);

    return () => {
      pwaElement.removeEventListener('pwa-install-success-event', handleSuccess);
      pwaElement.removeEventListener('pwa-user-choice-result-event', handleUserChoice);
    };
  }, []);

  const handleButtonClick = useCallback(() => {
    const pwaElement = containerRef.current?.querySelector('pwa-install') as PWAInstallElement | null;
    if (pwaElement) {
      pwaElement.showDialog(true);
    }
  }, []);

  return (
    <div ref={containerRef} className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      {/* PWA Install Web Component - must be visible for dialog to work */}
      <pwa-install
        manifest-url="/manifest.webmanifest"
        manual-apple="true"
        manual-chrome="true"
        use-local-storage="true"
        {...{ styles: pwaInstallStyles } as any}
      />

      {/* Visible Buttons */}
      {(platform === "ios" || platform === "both") && (
        <Button 
          variant={variant} 
          size={size}
          onClick={handleButtonClick}
          className="gap-2"
        >
          <Apple className="h-5 w-5" />
          <span>Download iOS</span>
        </Button>
      )}
      {(platform === "android" || platform === "both") && (
        <Button 
          variant={variant} 
          size={size}
          onClick={handleButtonClick}
          className="gap-2"
        >
          <Smartphone className="h-5 w-5" />
          <span>Download Android</span>
        </Button>
      )}
    </div>
  );
}
