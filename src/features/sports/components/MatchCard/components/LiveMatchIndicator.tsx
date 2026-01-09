import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface LiveMatchIndicatorProps {
  isLive?: boolean;
  score?: {
    home: number;
    away: number;
  };
  matchTime?: string;
  viewMode?: 'grid' | 'list' | 'horizontal';
}

export function LiveMatchIndicator({ 
  isLive = false, 
  score, 
  matchTime, 
  viewMode = 'grid' 
}: LiveMatchIndicatorProps) {
  if (!isLive) return null;

  if (viewMode === 'horizontal' || viewMode === 'list') {
    return (
      <div className="flex flex-col items-center gap-0.5 min-w-[80px]">
        <Badge variant="destructive" className="text-xs px-1.5 py-0.5 animate-pulse">
          LIVE
        </Badge>
        {matchTime && (
          <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span className="font-medium">{matchTime}</span>
          </div>
        )}
      </div>
    );
  }

  // Grid view
  return (
    <div className="flex items-center justify-between mb-1">
      <Badge variant="destructive" className="text-xs px-2 py-1 animate-pulse">
        • LIVE
      </Badge>
      {matchTime && (
        <div className="flex items-center gap-0.5 text-xs text-foreground font-semibold">
          <Clock className="h-3 w-3" />
          <span>{matchTime}</span>
        </div>
      )}
    </div>
  );
}