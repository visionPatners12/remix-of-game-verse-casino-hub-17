import React, { memo, useState } from 'react';
import { Clock } from 'lucide-react';
import { SportIcon } from '@/components/ui/sport-icon';
import { formatAzuroDateSmart, formatAzuroTime, parseToAzuroTimestamp } from '@/utils/azuroDateFormatters';
import { cn } from '@/lib/utils';

interface InlineMatchHeaderProps {
  league?: string;
  leagueLogo?: string;
  sportSlug?: string;
  startsAt?: string | number;
  className?: string;
}

/**
 * Ultra-compact header: Sport icon + League logo + League + Time
 * Single line, minimal height
 */
export const InlineMatchHeader = memo(function InlineMatchHeader({
  league,
  leagueLogo,
  sportSlug,
  startsAt,
  className
}: InlineMatchHeaderProps) {
  const [logoError, setLogoError] = useState(false);
  const showLeagueLogo = leagueLogo && !logoError;
  
  const timestamp = startsAt ? parseToAzuroTimestamp(startsAt) : null;
  const dateStr = timestamp ? formatAzuroDateSmart(timestamp) : null;
  const timeStr = timestamp ? formatAzuroTime(timestamp) : null;
  
  // Combine date and time smartly
  const dateTimeDisplay = dateStr && timeStr 
    ? `${dateStr} ${timeStr}` 
    : dateStr || timeStr;

  return (
    <div className={cn(
      "flex items-center justify-between gap-2 px-3 py-1.5",
      "bg-muted/30 border-b border-border/20",
      className
    )}>
      {/* Left: Sport icon + League logo + League */}
      <div className="flex items-center gap-1.5 min-w-0">
        <SportIcon 
          slug={sportSlug} 
          className="h-3.5 w-3.5 text-muted-foreground shrink-0" 
        />
        
        {showLeagueLogo && (
          <img 
            src={leagueLogo}
            alt={`${league} logo`}
            className="h-4 w-4 object-contain shrink-0"
            onError={() => setLogoError(true)}
          />
        )}
        
        <span className="text-xs font-medium text-muted-foreground truncate">
          {league || 'League'}
        </span>
      </div>
      
      {/* Right: Date/Time */}
      {dateTimeDisplay && (
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground/70 shrink-0">
          <Clock className="h-3 w-3" />
          <span>{dateTimeDisplay}</span>
        </div>
      )}
    </div>
  );
});
