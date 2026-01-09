import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useSelectionOdds } from '@azuro-org/sdk';
import { AvatarFallback } from '@/components/ui/avatar-fallback';
import { ConditionStateBadge } from '@/components/ui/condition-state-badge';
import { getConditionStateInfo } from '@/utils/conditionHelpers';
import { cn } from '@/lib/utils';
import { ConditionState } from '@/types';
import { getSportById } from '@/lib/sportsMapping';
import { formatAzuroDateSmart, formatAzuroTime, parseToAzuroTimestamp } from '@/utils/azuroDateFormatters';
import { useLeagueLogos } from '@/hooks/useLeagueLogos';
import { useSelectionEnrichment } from '../../hooks/useSelectionEnrichment';
import { useOddsDisplay } from '@/shared/hooks/useOddsDisplay';

interface SimpleSelectionCardProps {
  selection: any; // Temporarily use any until extended interface works
  onRemove: (selection: { conditionId: string; outcomeId: string; coreAddress: string }) => void;
  onEventClick?: (gameId: string) => void;
  isStatesFetching?: boolean;
  states?: Record<string, ConditionState>;
}

export function SimpleSelectionCard({ selection, onRemove, onEventClick, isStatesFetching, states }: SimpleSelectionCardProps) {
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});
  const { getLeagueLogo } = useLeagueLogos();

  // Enrich selection data if missing sport/league/date OR if league logo is missing
  const needsEnrichment = !selection.sport || 
                          !selection.league || 
                          !selection.startsAt || 
                          (typeof selection.league === 'string') || 
                          !selection.league?.logo;
  
  const { data: enrichedData, isLoading: isEnriching } = useSelectionEnrichment(
    needsEnrichment ? selection.gameId : undefined
  );

  // Use enriched data as fallback
  const displaySport = selection.sport || enrichedData?.sport;
  
  // Merge league intelligently to get the logo from enrichment
  const displayLeague = (() => {
    // If enrichedData has a logo, prioritize it
    if (enrichedData?.league?.logo) {
      return enrichedData.league;
    }
    // If selection.league is a string, convert to object
    if (typeof selection.league === 'string') {
      return { name: selection.league, slug: '', logo: undefined };
    }
    // Otherwise use selection.league or enrichedData.league
    return selection.league || enrichedData?.league || null;
  })();
  
  const displayStartsAt = selection.startsAt || enrichedData?.startsAt;
  const displayEventName = selection.eventName || enrichedData?.eventName || 'Match';
  const displayParticipants = selection.participants?.length ? 
    selection.participants : 
    enrichedData?.participants;

  const handleImageError = (imageKey: string) => {
    setImageErrors(prev => ({ ...prev, [imageKey]: true }));
  };

  // Use real odds from Azuro SDK
  const { data: selectionOdds, isFetching } = useSelectionOdds({
    selection,
    initialOdds: selection.odds
  });
  
  const displayOdds = selectionOdds || selection.odds || 1.0;
  
  // Use formatted odds from hook
  const { formattedOdds } = useOddsDisplay({ odds: displayOdds });

  // Get condition state
  const conditionState = states?.[selection.conditionId];
  const stateInfo = conditionState ? getConditionStateInfo(conditionState) : null;
  const isInactive = stateInfo && !stateInfo.isActive;

  const renderTeamImages = () => {
    // Use enriched participants if available
    const participants = displayParticipants || selection.participants;
    const images = (selection.participantImages?.length ?? 0) >= 2
      ? selection.participantImages
      : participants?.map((p: any) => p.image).filter((img: any): img is string => !!img);

    if (images && images.length >= 2) {
      return (
        <div className="flex items-center relative">
          <div className="w-8 h-8 relative z-10">
            {!imageErrors['participant0'] ? (
              <img 
                src={images[0]} 
                alt=""
                className="w-full h-full object-contain"
                onError={() => handleImageError('participant0')}
              />
            ) : (
              <AvatarFallback 
                name={displayEventName.split(' vs ')[0] || displayEventName} 
                variant="team" 
                size="md"
                className="w-8 h-8"
              />
            )}
          </div>
          <div className="w-8 h-8 -ml-2 relative z-0">
            {!imageErrors['participant1'] ? (
              <img 
                src={images[1]} 
                alt=""
                className="w-full h-full object-contain"
                onError={() => handleImageError('participant1')}
              />
            ) : (
              <AvatarFallback 
                name={displayEventName.split(' vs ')[1] || displayEventName} 
                variant="team" 
                size="md"
                className="w-8 h-8"
              />
            )}
          </div>
        </div>
      );
    } else if (images && images.length === 1) {
      return (
        <div className="w-8 h-8">
          {!imageErrors['participant0'] ? (
            <img 
              src={images[0]} 
              alt=""
              className="w-full h-full object-contain"
              onError={() => handleImageError('participant0')}
            />
          ) : (
            <AvatarFallback 
              name={displayEventName} 
              variant="team" 
              size="md"
              className="w-8 h-8"
            />
          )}
        </div>
      );
    } else if (selection.logoUrl) {
      return !imageErrors['logo'] ? (
        <img 
          src={selection.logoUrl} 
          alt=""
          className="w-8 h-8 object-contain"
          onError={() => handleImageError('logo')}
        />
      ) : (
        <AvatarFallback 
          name={displayEventName} 
          variant="team" 
          size="md"
          className="w-8 h-8"
        />
      );
    } else {
      return (
        <AvatarFallback 
          name={displayEventName} 
          variant="team" 
          size="md"
          className="w-8 h-8"
        />
      );
    }
  };

  return (
    <div className={cn(
      "bg-transparent px-4 py-3 min-h-[80px] flex items-center relative transition-colors duration-200 hover:bg-muted/20",
      (isStatesFetching || isEnriching) && "opacity-60",
      isInactive && "opacity-50 grayscale"
    )}>
      {/* Media Zone - Participant Images */}
      <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 relative">
        {renderTeamImages()}
      </div>

      {/* Text Block */}
      <div className="flex-1 ml-3 min-w-0">
        {/* Sport + League + Date Header */}
        <div className="mb-1 overflow-hidden">
          {/* Sport icon + League logo + name - compact single line */}
          <div className="flex items-center gap-1.5 text-xs mb-0.5">
            {/* Sport Icon only */}
            {displaySport && (() => {
              const sportKey = typeof displaySport === 'string' 
                ? displaySport 
                : (displaySport?.slug || displaySport?.name);
              
              if (!sportKey) return null;
              
              const sportInfo = getSportById(sportKey);
              const SportIcon = sportInfo.icon;
              return (
                <SportIcon className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
              );
            })()}
            
            {/* League Logo + Name */}
            {displayLeague && (
              <div className="flex items-center gap-1 min-w-0 flex-1">
                {displayLeague.logo ? (
                  <img 
                    src={displayLeague.logo}
                    alt=""
                    className="h-3.5 w-3.5 object-contain flex-shrink-0 rounded-sm"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="h-3.5 w-3.5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[6px] font-bold text-primary">
                      {displayLeague.name.charAt(0)}
                    </span>
                  </div>
                )}
                <span className="text-muted-foreground truncate text-[11px]">
                  {displayLeague.name}
                </span>
              </div>
            )}
          </div>
          
          {/* Date + Time */}
          {displayStartsAt && (
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              {(() => {
                const timestamp = parseToAzuroTimestamp(displayStartsAt);
                return timestamp ? (
                  <>
                    <span>{formatAzuroDateSmart(timestamp)}</span>
                    <span className="font-medium text-foreground/70">{formatAzuroTime(timestamp)}</span>
                  </>
                ) : (
                  <span>Invalid date</span>
                );
              })()}
            </div>
          )}
        </div>
        
        <p 
          className={cn(
            "text-sm font-medium text-foreground",
            onEventClick && selection.gameId && !isInactive && "cursor-pointer hover:text-primary transition-colors"
          )}
          onClick={() => selection.gameId && !isInactive && onEventClick?.(selection.gameId)}
        >
          {displayEventName || 'Match'}
        </p>
        
        {/* Market Type → Pick on same line */}
        <p className="text-xs text-muted-foreground truncate">
          <span className="font-medium">{selection.marketType}</span>
          <span className="mx-1.5">→</span>
          <span className="text-primary font-medium">{selection.pick}</span>
        </p>

        {/* Condition State Badge */}
        {stateInfo && (
          <div className="mt-1">
            <ConditionStateBadge state={conditionState} />
          </div>
        )}
      </div>

      {/* Odds */}
      <div className="ml-4 pl-3 border-l border-border/30 min-w-[50px] text-right flex-shrink-0">
        <div className="flex items-center justify-end gap-1.5">
          <span className="text-sm font-bold text-foreground">
            {formattedOdds}
            {(isFetching || isStatesFetching || isEnriching) && <span className="ml-1 animate-pulse">⟳</span>}
          </span>
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove({
            conditionId: selection.conditionId,
            outcomeId: selection.outcomeId,
            coreAddress: selection.coreAddress || ''
          });
        }}
        className="absolute top-1 right-2 w-5 h-5 rounded bg-background/90 backdrop-blur-sm hover:bg-destructive/15 flex items-center justify-center text-muted-foreground hover:text-destructive transition-all duration-200 hover:scale-110 shadow-sm border border-border/50"
        aria-label="Remove selection"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}