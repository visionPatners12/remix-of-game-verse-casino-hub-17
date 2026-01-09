import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PolymarketCTAButtonProps {
  onConfirm: () => void;
  amount: number;
  isLoading: boolean;
  isConnected: boolean;
  isReady?: boolean;
  isRecovering?: boolean;
  needsReconnection?: boolean;
  outcome: 'YES' | 'NO';
  disabled?: boolean;
}

export function PolymarketCTAButton({
  onConfirm,
  amount,
  isLoading,
  isConnected,
  isRecovering = false,
  needsReconnection = false,
  disabled = false,
}: PolymarketCTAButtonProps) {
  const isDisabled = isLoading || isRecovering || disabled || (isConnected && amount < 1);

  const getCtaText = () => {
    if (isRecovering) return 'Loading...';
    if (needsReconnection) return 'Reconnect Wallet';
    if (!isConnected) return 'Connect Wallet';
    return `BET $${amount.toFixed(0)}`;
  };

  return (
    <motion.button
      onClick={onConfirm}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.02 } : undefined}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
      className={cn(
        "relative w-full py-3.5 rounded-xl font-semibold text-base transition-all overflow-hidden",
        "bg-primary text-primary-foreground",
        !isDisabled && "hover:bg-primary/90",
        isDisabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Shimmer effect */}
      {!isDisabled && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 2,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          getCtaText()
        )}
      </span>
    </motion.button>
  );
}
