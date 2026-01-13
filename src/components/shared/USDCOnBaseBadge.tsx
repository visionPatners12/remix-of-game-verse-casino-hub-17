import { TokenUSDC, NetworkBase } from '@web3icons/react';
import { cn } from '@/lib/utils';

interface USDCOnBaseBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'card';
  showLabel?: boolean;
  className?: string;
}

export const USDCOnBaseBadge = ({ 
  size = 'md', 
  variant = 'default',
  showLabel = true,
  className 
}: USDCOnBaseBadgeProps) => {
  const iconSize = size === 'sm' ? 20 : size === 'lg' ? 32 : 24;
  const textSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base';
  
  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <TokenUSDC variant="branded" size={iconSize} />
        <NetworkBase variant="branded" size={iconSize} />
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn(
        "flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 rounded-2xl border border-primary/20",
        className
      )}>
        <TokenUSDC variant="branded" size={iconSize} />
        <span className={cn("font-semibold text-foreground", textSize)}>USDC</span>
        <span className="text-muted-foreground">on</span>
        <NetworkBase variant="branded" size={iconSize} />
        <span className={cn("font-semibold text-foreground", textSize)}>Base</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <TokenUSDC variant="branded" size={iconSize} />
      {showLabel && <span className={cn("font-medium text-foreground", textSize)}>USDC</span>}
      {showLabel && <span className="text-muted-foreground text-sm">on</span>}
      <NetworkBase variant="branded" size={iconSize} />
      {showLabel && <span className={cn("font-medium text-foreground", textSize)}>Base</span>}
    </div>
  );
};
