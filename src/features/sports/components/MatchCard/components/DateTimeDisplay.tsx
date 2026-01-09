import React from "react";
import { Calendar, Clock } from "lucide-react";
import { parseToAzuroTimestamp, formatAzuroDateSmart, formatAzuroTime } from "@/utils/azuroDateFormatters";

interface DateTimeDisplayProps {
  startingAt: string | number;
  viewMode?: 'grid' | 'list' | 'horizontal';
}

export function DateTimeDisplay({ startingAt, viewMode = 'grid' }: DateTimeDisplayProps) {
  const timestamp = parseToAzuroTimestamp(startingAt);
  
  if (!timestamp) {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Calendar className="h-3 w-3" />
        <span>Date non disponible</span>
      </div>
    );
  }

  let dateDisplay = 'Date invalide';
  let timeDisplay = '--:--';

  try {
    dateDisplay = formatAzuroDateSmart(timestamp);
    timeDisplay = formatAzuroTime(timestamp);
  } catch (error) {
    console.error('Error formatting date:', error, { startingAt, timestamp });
  }

  if (viewMode === 'horizontal' || viewMode === 'list') {
    return (
      <div className="flex items-center justify-between w-full text-xs mb-1">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{dateDisplay}</span>
        </div>
        <div className="flex items-center gap-1 font-semibold text-foreground">
          <Clock className="h-3 w-3" />
          <span>{timeDisplay}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
      <div className="flex items-center gap-1">
        <Calendar className="h-3 w-3" />
        <span>{dateDisplay}</span>
      </div>
      <div className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        <span>{timeDisplay}</span>
      </div>
    </div>
  );
}