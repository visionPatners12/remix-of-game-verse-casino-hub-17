import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Smartphone, 
  Zap, 
  Bell, 
  Trophy,
  X
} from 'lucide-react';
import { PWAInstallButton } from '@/components/pwa/PWAInstallButton';

interface InstallAppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action?: 'bet' | 'follow' | 'comment' | 'create' | 'wallet';
  onContinueWeb?: () => void;
}

const ACTION_MESSAGES: Record<string, { title: string; subtitle: string }> = {
  bet: {
    title: 'Place your bet on PRYZEN',
    subtitle: 'Install the app for real-time betting and notifications'
  },
  follow: {
    title: 'Follow your favorites',
    subtitle: 'Get updates and personalized content'
  },
  comment: {
    title: 'Join the conversation',
    subtitle: 'Comment and interact with the community'
  },
  create: {
    title: 'Share your predictions',
    subtitle: 'Create posts and build your reputation'
  },
  wallet: {
    title: 'Access your wallet',
    subtitle: 'Manage your funds securely in the app'
  },
};

const BENEFITS = [
  { icon: Zap, text: 'Lightning-fast betting' },
  { icon: Bell, text: 'Real-time notifications' },
  { icon: Trophy, text: 'Exclusive features' },
];

export function InstallAppModal({ 
  open, 
  onOpenChange, 
  action = 'bet',
  onContinueWeb 
}: InstallAppModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const actionMessage = ACTION_MESSAGES[action] || ACTION_MESSAGES.bet;

  const handleContinueWeb = () => {
    onOpenChange(false);
    onContinueWeb?.();
  };

  const handleGoToLanding = () => {
    onOpenChange(false);
    navigate('/');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 bg-background border-border overflow-hidden">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-background p-6 pb-8">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
          
          {/* App mockup */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-lg shadow-primary/20">
                <Smartphone className="h-10 w-10 text-primary" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <Zap className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>
          
          <DialogHeader className="text-center space-y-2">
            <DialogTitle className="text-xl font-bold text-foreground">
              {actionMessage.title}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {actionMessage.subtitle}
            </p>
          </DialogHeader>
        </div>

        {/* Benefits */}
        <div className="px-6 py-4 space-y-3">
          {BENEFITS.map((benefit, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <benefit.icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">{benefit.text}</span>
            </div>
          ))}
        </div>

        {/* Install buttons */}
        <div className="px-6 py-4 space-y-3">
          <PWAInstallButton platform="both" className="w-full" />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>
          
          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
            onClick={handleGoToLanding}
          >
            Learn more about PRYZEN
          </Button>
        </div>

        {/* Continue on web option */}
        {onContinueWeb && (
          <div className="px-6 pb-6">
            <button
              onClick={handleContinueWeb}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Continue browsing (limited features)
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
