import React from 'react';
import { Button } from '@/ui';
import { Loader2, ExternalLink } from 'lucide-react';
import type { BetMode } from '../../types';
import { useWalletDeepLink } from '@/hooks/useWalletDeepLink';

interface PrimaryCTAProps {
  canSubmit: boolean;
  selectionsCount: number;
  mode: BetMode;
  isSubmitting?: boolean;
  onSubmit?: () => void;
  onPublish?: () => void;
  isPublishing?: boolean;
}

export function PrimaryCTA({ 
  canSubmit, 
  selectionsCount, 
  mode, 
  isSubmitting = false,
  onSubmit,
  onPublish,
  isPublishing = false
}: PrimaryCTAProps) {
  const { openWallet, shouldShowOpenWallet } = useWalletDeepLink();

  const getButtonText = () => {
    if (isSubmitting) return 'CONFIRMING IN WALLET...';
    if (selectionsCount === 0) return 'ADD SELECTIONS';
    return 'BUY';
  };

  const handleClick = () => {
    if (canSubmit && !isSubmitting && onSubmit) {
      onSubmit();
    }
  };

  const handlePublishClick = () => {
    if (canSubmit && !isPublishing && onPublish) {
      onPublish();
    }
  };

  return (
    <div className="space-y-2 mt-3">
      <Button
        disabled={!canSubmit || isSubmitting}
        className="w-full h-11 text-sm font-semibold rounded-md"
        style={{ height: '44px' }}
        onClick={handleClick}
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {getButtonText()}
      </Button>

      {/* Open Wallet Button - Mobile fallback for external wallets */}
      {shouldShowOpenWallet && isSubmitting && (
        <Button
          variant="outline"
          className="w-full h-11 text-sm font-semibold rounded-md border-primary/30 text-primary hover:bg-primary/10"
          style={{ height: '44px' }}
          onClick={openWallet}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          OPEN WALLET TO CONFIRM
        </Button>
      )}
      
      {selectionsCount > 0 && (
        <Button
          variant="outline"
          disabled={!canSubmit || isPublishing}
          className="w-full h-11 text-sm font-semibold rounded-md"
          style={{ height: '44px' }}
          onClick={handlePublishClick}
        >
          {isPublishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPublishing ? 'PUBLISHING...' : 'PUBLISH BET'}
        </Button>
      )}
    </div>
  );
}