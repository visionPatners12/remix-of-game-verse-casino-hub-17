import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Zap } from 'lucide-react';
import { useSelectionOdds } from '@azuro-org/sdk';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { AvatarFallback } from '@/components/ui/avatar-fallback';
import { useOddsDisplay } from '@/shared/hooks/useOddsDisplay';
import { parseToAzuroTimestamp } from '@/utils/azuroDateFormatters';
import { getSportIcon } from '@/lib/sportIcons';
import { useSelectionEnrichment } from '../../../hooks/useSelectionEnrichment';
import { OddsBadge } from './OddsBadge';
import { SwipeToDelete } from './SwipeToDelete';

interface CompactSelectionCardProps {
  selection: any;
  onRemove: (selection: { conditionId: string; outcomeId: string; coreAddress: string }) => void;
  onEventClick?: (gameId: string) => void;
  isStatesFetching?: boolean;
  states?: Record<string, any>;
  index: number;
}

export function CompactSelectionCard({ 
  selection, 
  onRemove, 
  onEventClick, 
  isStatesFetching, 
  states,
  index 
}: CompactSelectionCardProps) {
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});
  const [prevOdds, setPrevOdds] = useState<number | undefined>();

  // Always enrich to get sport slug from DB
  const { data: enrichedData, isLoading: isEnriching } = useSelectionEnrichment(selection.gameId);

  // Use sport data directly from DB via enrichedData
  const sportData = enrichedData?.sport;
  const sportName = sportData?.name || (typeof selection.sport === 'string' ? selection.sport : selection.sport?.name) || 'Sport';
  const SportIcon = getSportIcon(sportData?.icon_name);
  
  const displayEventName = selection.eventName || enrichedData?.eventName || 'Match';
  const displayParticipants = selection.participants?.length ? selection.participants : enrichedData?.participants;
  const displayLeague = selection.league?.name || (typeof selection.league === 'string' ? selection.league : null) || enrichedData?.league?.name;
  const leagueLogo = selection.league?.logo || enrichedData?.league?.logo;
  const rawStartsAt = selection.startsAt || enrichedData?.startsAt;
  const timestamp = rawStartsAt ? parseToAzuroTimestamp(rawStartsAt) : null;
  const formattedDate = timestamp ? format(new Date(timestamp * 1000), 'dd/MM HH:mm') : null;

  // Real odds from Azuro SDK
  const { data: selectionOdds, isFetching } = useSelectionOdds({
    selection,
    initialOdds: selection.odds
  });
  
  const displayOdds = selectionOdds || selection.odds || 1.0;
  const { formattedOdds } = useOddsDisplay({ odds: displayOdds });

  // Track odds changes
  React.useEffect(() => {
    if (selectionOdds && prevOdds !== selectionOdds) {
      setPrevOdds(displayOdds);
    }
  }, [selectionOdds]);

  const conditionState = states?.[selection.conditionId];
  const isLive = conditionState === 'Live';
  const isInactive = conditionState && conditionState !== 'Active' && conditionState !== 'Live';

  const handleRemove = () => {
    onRemove({
      conditionId: selection.conditionId,
      outcomeId: selection.outcomeId,
      coreAddress: selection.coreAddress || ''
    });
  };

  const renderStackedAvatars = () => {
    const participants = displayParticipants || [];
    const images = participants.map((p: any) => p.image).filter(Boolean);

    if (images.length >= 2) {
      return (
        <div className="relative flex items-center">
          <div className="w-8 h-8 rounded-full border-2 border-background overflow-hidden z-10 bg-muted">
            {!imageErrors['p0'] ? (
              <img 
                src={images[0]} 
                alt=""
                className="w-full h-full object-cover"
                onError={() => setImageErrors(prev => ({ ...prev, p0: true }))}
              />
            ) : (
              <AvatarFallback name={displayEventName.split(' vs ')[0]} variant="team" size="sm" />
            )}
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-background overflow-hidden -ml-3 bg-muted">
            {!imageErrors['p1'] ? (
              <img 
                src={images[1]} 
                alt=""
                className="w-full h-full object-cover"
                onError={() => setImageErrors(prev => ({ ...prev, p1: true }))}
              />
            ) : (
              <AvatarFallback name={displayEventName.split(' vs ')[1]} variant="team" size="sm" />
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
        <AvatarFallback name={displayEventName} variant="team" size="sm" />
      </div>
    );
  };

  return (
    <SwipeToDelete onDelete={handleRemove}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className={cn(
          "relative px-1 py-2 flex flex-col gap-1",
          "transition-all duration-200",
          (isStatesFetching || isEnriching) && "opacity-60",
          isInactive && "opacity-40 grayscale"
        )}
      >
        {/* Sport & League - Full width top line */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <SportIcon className="h-3 w-3 flex-shrink-0" />
          <span>{sportName}</span>
          {displayLeague && (
            <>
              <span>•</span>
              {leagueLogo && (
                <img 
                  src={leagueLogo}
                  alt=""
                  className="h-3 w-3 rounded-sm object-contain flex-shrink-0"
                  onError={(e) => e.currentTarget.style.display = 'none'}
                />
              )}
              <span>{displayLeague}</span>
            </>
          )}
        </div>

        {/* Main row: Avatars + Content + Odds + Close */}
        <div className="flex items-center gap-2">
          {/* Stacked Avatars */}
          <div className="flex-shrink-0 relative">
            {renderStackedAvatars()}
            {isLive && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive flex items-center justify-center"
              >
                <Zap className="h-2.5 w-2.5 text-destructive-foreground" />
              </motion.div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Date & Time */}
            {formattedDate && (
              <div className="text-xs text-muted-foreground">
                {formattedDate}
              </div>
            )}

            {/* Event Name - Full display */}
            <p 
              className={cn(
                "text-sm font-semibold text-foreground line-clamp-2",
                onEventClick && enrichedData?.id && !isInactive && "cursor-pointer hover:text-primary"
              )}
              onClick={() => {
                const matchUuid = enrichedData?.id;
                if (matchUuid && !isInactive && onEventClick) {
                  onEventClick(matchUuid);
                }
              }}
            >
              {displayEventName}
            </p>

            {/* Market & Pick */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-muted-foreground truncate">{selection.marketType}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs font-semibold text-primary truncate">{selection.pick}</span>
            </div>
          </div>

          {/* Odds Badge */}
          <div className="flex-shrink-0">
            <OddsBadge 
              odds={formattedOdds}
              previousOdds={prevOdds}
              currentOdds={displayOdds}
              isLoading={isFetching || isStatesFetching || isEnriching}
              size="md"
            />
          </div>

          {/* Close Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            className="flex-shrink-0 w-6 h-6 rounded-full bg-muted/50 hover:bg-destructive/10 
                       flex items-center justify-center text-muted-foreground hover:text-destructive 
                       transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </motion.button>
        </div>
      </motion.div>
    </SwipeToDelete>
  );
}
