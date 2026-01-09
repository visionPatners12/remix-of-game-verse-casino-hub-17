import React from 'react';
import { getSportBySlug } from '@/lib/sportsMapping';
import { cn } from '@/lib/utils';

interface SportIconProps {
  slug?: string | null;
  name?: string | null;
  className?: string;
  showName?: boolean;
}

/**
 * Sport icon component - uses sportsMapping for slug → React icon conversion
 * Optionally displays sport name next to the icon
 */
export function SportIcon({ slug, name, className, showName = false }: SportIconProps) {
  const sportInfo = getSportBySlug(slug || '');
  const Icon = sportInfo.icon;
  
  if (showName && name) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <Icon className={cn("h-4 w-4", className)} />
        <span className="text-sm">{name}</span>
      </span>
    );
  }
  
  return <Icon className={cn("h-4 w-4", className)} />;
}
