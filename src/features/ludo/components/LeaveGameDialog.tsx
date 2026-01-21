/**
 * Leave Game Dialog - Confirmation dialog for leaving a game
 * Contextual messages based on game status (waiting room vs active game)
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DoorOpen, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaveGameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gameStatus: 'created' | 'active';
  betAmount: number;
  isLeaving: boolean;
  onConfirm: () => void;
}

export const LeaveGameDialog: React.FC<LeaveGameDialogProps> = ({
  open,
  onOpenChange,
  gameStatus,
  betAmount,
  isLeaving,
  onConfirm,
}) => {
  const { t } = useTranslation('games');
  
  const isWaitingRoom = gameStatus === 'created';
  const hasBet = betAmount > 0;
  
  // Contextual content
  const title = isWaitingRoom
    ? t('ludo.leaveDialog.waitingTitle')
    : t('ludo.leaveDialog.activeTitle');
  
  const description = isWaitingRoom
    ? hasBet
      ? t('ludo.leaveDialog.waitingRefund', { amount: betAmount })
      : t('ludo.leaveDialog.waitingDesc')
    : hasBet
      ? t('ludo.leaveDialog.activeLoss', { amount: betAmount })
      : t('ludo.leaveDialog.activeDesc');
  
  const confirmText = isWaitingRoom
    ? t('ludo.leaveDialog.confirm')
    : t('ludo.leaveDialog.confirmForfeit');

  const Icon = isWaitingRoom ? DoorOpen : AlertTriangle;
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[340px] rounded-2xl border-white/10 bg-card/95 backdrop-blur-xl">
        <AlertDialogHeader className="space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <Icon className={cn(
              "h-7 w-7",
              isWaitingRoom ? "text-muted-foreground" : "text-destructive"
            )} />
          </div>
          <AlertDialogTitle className="text-center text-lg font-semibold">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-sm text-muted-foreground">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 flex-col gap-2 sm:flex-col">
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLeaving}
            className={cn(
              "w-full gap-2",
              isWaitingRoom
                ? "bg-muted hover:bg-muted/80 text-foreground"
                : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            )}
          >
            {isLeaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('ludo.leaveDialog.leaving')}
              </>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
          <AlertDialogCancel 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border-0"
            disabled={isLeaving}
          >
            {t('ludo.leaveDialog.cancel')}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LeaveGameDialog;
