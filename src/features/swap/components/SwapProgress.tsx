// Swap execution progress component
import React from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, X, ExternalLink } from 'lucide-react';
import type { SwapExecutionStep } from '../types';
import { getExplorerUrl, truncateAddress } from '../utils/formatters';

interface SwapProgressProps {
  steps: SwapExecutionStep[];
  chainId: number;
}

export function SwapProgress({ steps, chainId }: SwapProgressProps) {
  return (
    <div className="space-y-3 py-4">
      {steps.map((step, index) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center gap-3"
        >
          {/* Status icon */}
          <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
            step.status === 'completed' ? 'bg-success/20 text-success' :
            step.status === 'active' ? 'bg-primary/20 text-primary' :
            step.status === 'failed' ? 'bg-destructive/20 text-destructive' :
            'bg-muted/20 text-muted-foreground'
          }`}>
            {step.status === 'completed' ? (
              <Check className="h-4 w-4" />
            ) : step.status === 'active' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : step.status === 'failed' ? (
              <X className="h-4 w-4" />
            ) : (
              <div className="h-2 w-2 rounded-full bg-current opacity-50" />
            )}
          </div>

          {/* Step info */}
          <div className="flex-1 min-w-0">
            <div className={`font-medium ${
              step.status === 'active' ? 'text-foreground' :
              step.status === 'pending' ? 'text-muted-foreground' :
              'text-foreground'
            }`}>
              {step.message}
            </div>
            
            {step.txHash && (
              <a
                href={getExplorerUrl(chainId, step.txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <span>{truncateAddress(step.txHash, 6)}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          {/* Connection line */}
          {index < steps.length - 1 && (
            <div className="absolute left-4 top-10 w-px h-6 bg-border/50" />
          )}
        </motion.div>
      ))}
    </div>
  );
}
