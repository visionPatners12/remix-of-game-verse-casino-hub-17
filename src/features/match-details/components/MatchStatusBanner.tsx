import React from 'react';
import { cn } from '@/lib/utils';

interface MatchStatusBannerProps {
  description?: string | null;
  report?: string | null;
  className?: string;
}

export function MatchStatusBanner({ description, report, className }: MatchStatusBannerProps) {
  if (!description && !report) return null;
  
  return (
    <div className={cn(
      "flex items-center justify-center gap-2 text-xs text-muted-foreground py-2",
      className
    )}>
      {description && <span>{description}</span>}
      {description && report && <span>•</span>}
      {report && <span className="truncate max-w-[200px]">{report}</span>}
    </div>
  );
}
