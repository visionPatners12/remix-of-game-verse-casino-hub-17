import React from 'react';
import { Trophy, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectionResultBadgeProps {
  isWon: boolean;
  className?: string;
}

/**
 * Premium Won/Lost badge with gradients and animations
 */
export function SelectionResultBadge({ isWon, className }: SelectionResultBadgeProps) {
  if (isWon) {
    return (
      <div className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide',
        'bg-gradient-to-r from-emerald-500 to-green-500 text-white',
        'shadow-lg shadow-green-500/30 ring-2 ring-green-400/20',
        className
      )}>
        <Trophy className="h-3.5 w-3.5" />
        <span>WON</span>
      </div>
    );
  }

  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide',
      'bg-gradient-to-r from-red-500 to-rose-500 text-white/95',
      'shadow-lg shadow-red-500/25 ring-2 ring-red-400/15',
      className
    )}>
      <XCircle className="h-3.5 w-3.5" />
      <span>LOST</span>
    </div>
  );
}
