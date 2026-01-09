import React, { memo } from 'react';
import { MapPin, User, Sun, Cloud, CloudRain } from 'lucide-react';
import type { MatchVenue, MatchReferee, MatchForecast } from '../hooks/useMatchData';

interface MatchInfoBarProps {
  venue?: MatchVenue | null;
  referee?: MatchReferee | null;
  forecast?: MatchForecast | null;
}

const getWeatherIcon = (status: string | null) => {
  if (!status) return <Cloud className="h-3 w-3 text-muted-foreground" />;
  
  const statusLower = status.toLowerCase();
  if (statusLower.includes('sun') || statusLower.includes('clear')) {
    return <Sun className="h-3 w-3 text-yellow-500" />;
  }
  if (statusLower.includes('rain') || statusLower.includes('shower')) {
    return <CloudRain className="h-3 w-3 text-blue-400" />;
  }
  return <Cloud className="h-3 w-3 text-muted-foreground" />;
};

export const MatchInfoBar = memo(function MatchInfoBar({ venue, referee, forecast }: MatchInfoBarProps) {
  // Handle referee array (baseball umpires) - get Home Plate Umpire
  const displayReferee = Array.isArray(referee)
    ? referee.find(r => r.position?.toLowerCase().includes('home plate')) || referee[0]
    : referee;
  
  // Don't render if no data available
  const hasVenue = venue?.name || venue?.city;
  const hasReferee = displayReferee?.name;
  const hasForecast = forecast?.temperature !== null && forecast?.temperature !== undefined;
  
  if (!hasVenue && !hasReferee && !hasForecast) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-2 bg-muted/20 text-xs text-muted-foreground border-b border-border/20">
      {hasVenue && (
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          <span>
            {venue?.name}
            {venue?.city && venue?.name && ', '}
            {venue?.city}
            {venue?.capacity && ` • ${venue.capacity.toLocaleString()}`}
          </span>
        </span>
      )}
      
      {hasReferee && (
        <span className="flex items-center gap-1">
          <User className="h-3 w-3" />
          <span>
            {displayReferee?.name}
            {displayReferee?.nationality && ` (${displayReferee.nationality})`}
            {displayReferee?.position && ` • ${displayReferee.position}`}
          </span>
        </span>
      )}
      
      {hasForecast && (
        <span className="flex items-center gap-1">
          {getWeatherIcon(forecast?.status || null)}
          <span>
            {String(forecast?.temperature ?? '').includes('°')
              ? forecast?.temperature
              : `${forecast?.temperature}°C`}
          </span>
        </span>
      )}
    </div>
  );
});
