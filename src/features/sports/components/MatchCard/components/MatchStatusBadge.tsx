import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { getStatusLongInfo } from "@/features/sports/utils/statusLongMapper";
import { cn } from "@/lib/utils";

interface MatchStatusBadgeProps {
  statusLong: string | null | undefined;
  elapsedTime?: string;
  className?: string;
}

export function MatchStatusBadge({ statusLong, elapsedTime, className }: MatchStatusBadgeProps) {
  const statusInfo = getStatusLongInfo(statusLong);

  const getIcon = () => {
    switch (statusInfo.status) {
      case 'inplay':
        return <Clock className="h-3 w-3" />;
      case 'finished':
        return <CheckCircle2 className="h-3 w-3" />;
      case 'cancelled':
      case 'abandoned':
        return <XCircle className="h-3 w-3" />;
      case 'postponed':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge variant={statusInfo.badgeVariant}>
        <span className="flex items-center gap-1">
          {getIcon()}
          {statusInfo.displayText}
        </span>
      </Badge>
      {elapsedTime && statusInfo.isLive && (
        <span className="text-xs font-semibold text-foreground">
          {elapsedTime}
        </span>
      )}
    </div>
  );
}
