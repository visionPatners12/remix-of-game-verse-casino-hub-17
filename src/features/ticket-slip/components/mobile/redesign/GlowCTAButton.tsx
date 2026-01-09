import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Zap, Share2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWalletDeepLink } from '@/hooks/useWalletDeepLink';

interface GlowCTAButtonProps {
  onSubmit: () => void;
  onPublish?: () => void;
  isSubmitting: boolean;
  isPublishing?: boolean;
  canSubmit: boolean;
  potentialWin: number;
  currency?: string;
  className?: string;
}

export function GlowCTAButton({ 
  onSubmit, 
  onPublish,
  isSubmitting, 
  isPublishing,
  canSubmit,
  potentialWin,
  currency = 'USDT',
  className 
}: GlowCTAButtonProps) {
  const isLoading = isSubmitting || isPublishing;
  const { openWallet, shouldShowOpenWallet } = useWalletDeepLink();

  // Just call onSubmit - wallet opening is handled by useWalletTransaction hook
  const handleSubmitWithWallet = () => {
    onSubmit();
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Main CTA */}
      <motion.button
        whileHover={{ scale: canSubmit && !isLoading ? 1.02 : 1 }}
        whileTap={{ scale: canSubmit && !isLoading ? 0.98 : 1 }}
        onClick={handleSubmitWithWallet}
        disabled={!canSubmit || isLoading}
        className={cn(
          "relative w-full h-14 rounded-2xl font-bold text-base",
          "transition-all duration-300",
          "overflow-hidden",
          canSubmit 
            ? "bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground" 
            : "bg-muted text-muted-foreground cursor-not-allowed"
        )}
      >
        {/* Glow Effect */}
        {canSubmit && !isLoading && (
          <motion.div
            animate={{
              opacity: [0.4, 0.7, 0.4],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 rounded-2xl bg-primary/50 blur-xl -z-10"
          />
        )}

        {/* Shimmer Effect */}
        {canSubmit && !isLoading && (
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 1
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
          />
        )}

        {/* Content */}
        <div className="relative flex items-center justify-center gap-3">
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>CONFIRMING IN WALLET...</span>
            </>
          ) : (
            <>
              <Zap className="h-5 w-5" />
              <span>PLACE BET</span>
              {potentialWin > 0 && (
                <span className="opacity-80">
                  • Win ${potentialWin.toFixed(2)}
                </span>
              )}
            </>
          )}
        </div>
      </motion.button>

      {/* Open Wallet Button - Mobile fallback for external wallets */}
      {shouldShowOpenWallet && isSubmitting && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.98 }}
          onClick={openWallet}
          className={cn(
            "w-full h-11 rounded-xl font-semibold text-sm",
            "bg-primary/10 text-primary border border-primary/30",
            "hover:bg-primary/20",
            "transition-all duration-200",
            "flex items-center justify-center gap-2"
          )}
        >
          <ExternalLink className="h-4 w-4" />
          <span>OPEN WALLET TO CONFIRM</span>
        </motion.button>
      )}

      {/* Secondary Action - Publish */}
      {onPublish && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onPublish}
          disabled={!canSubmit || isLoading}
          className={cn(
            "w-full h-11 rounded-xl font-semibold text-sm",
            "bg-muted/50 text-foreground border border-border/50",
            "hover:bg-muted hover:border-primary/30",
            "transition-all duration-200",
            "flex items-center justify-center gap-2",
            (!canSubmit || isLoading) && "opacity-50 cursor-not-allowed"
          )}
        >
          {isPublishing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>PUBLISHING...</span>
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" />
              <span>SHARE BET</span>
            </>
          )}
        </motion.button>
      )}
    </div>
  );
}
