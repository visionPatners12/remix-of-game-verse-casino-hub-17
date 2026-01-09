import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Wallet, Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
}

export const LoadingOverlay = ({ 
  isVisible, 
  onClose,
  title = "Connecting...",
  subtitle = "Please wait"
}: LoadingOverlayProps) => {
  return (
    <Dialog open={isVisible} onOpenChange={onClose}>
      <DialogContent 
        className="fixed bottom-0 left-0 right-0 top-auto translate-x-0 translate-y-0 rounded-t-xl rounded-b-none border-0 max-w-none w-full data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom [&>button]:hidden" 
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center space-y-6 text-center py-4">
          {/* Animated logo/icon */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse"></div>
            <div className="relative bg-primary/10 p-6 rounded-full">
              <Wallet className="h-12 w-12 text-primary animate-bounce" />
            </div>
          </div>
          
          {/* Spinner */}
          <div className="relative">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
          
          {/* Text */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
            <p className="text-sm text-muted-foreground max-w-sm">{subtitle}</p>
          </div>
          
          {/* Progress indicator */}
          <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
