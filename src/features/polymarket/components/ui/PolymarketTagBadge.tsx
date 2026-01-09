import React from 'react';
import { Badge } from '@/ui';
import { cn } from '@/utils';

export interface PolymarketTag {
  id: string;
  label: string;
  slug: string;
}

interface PolymarketTagBadgeProps {
  tag: PolymarketTag;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'secondary';
  className?: string;
}

export const PolymarketTagBadge: React.FC<PolymarketTagBadgeProps> = ({
  tag,
  onClick,
  variant = 'secondary',
  className
}) => (
  <Badge 
    variant={variant}
    className={cn(
      "text-xs",
      onClick && "cursor-pointer hover:bg-accent",
      className
    )}
    onClick={onClick}
  >
    #{tag.label}
  </Badge>
);

PolymarketTagBadge.displayName = 'PolymarketTagBadge';
