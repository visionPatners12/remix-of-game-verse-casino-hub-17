import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Heart, Rocket } from 'lucide-react';

interface BetaWarningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  platform: 'ios' | 'android';
}

export function BetaWarningDialog({ 
  isOpen, 
  onClose, 
  onConfirm,
  platform 
}: BetaWarningDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Rocket className="h-6 w-6 text-primary" />
            Beta Version
          </DialogTitle>
          <DialogDescription className="sr-only">
            Important information about the PRYZEN beta version
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-foreground font-medium">
            Welcome to PRYZEN Beta! 🎉
          </p>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">On-chain betting</span> features work perfectly
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">
                Some <span className="text-foreground font-medium">sports data</span> may be incomplete or not 100% reliable
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <Heart className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">Thank you</span> for participating in the app development!
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={onConfirm} className="w-full sm:w-auto">
            Got it, install on {platform === 'ios' ? 'iOS' : 'Android'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
