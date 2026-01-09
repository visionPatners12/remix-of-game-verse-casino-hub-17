import React, { memo } from 'react';
import { cn } from '@/lib/utils';

interface BaseballEventCardProps {
  event: {
    id?: string | number;
    type?: string;
    teamId?: number;
    description?: string;
    currentOuts?: number;
    period?: string;
    pitch?: {
      type?: string;
      velocity?: number;
      ballsCount?: number;
      strikesCount?: number;
    };
    result?: {
      ballsCount?: number;
      strikesCount?: number;
    };
    score?: {
      away?: number;
      home?: number;
    };
    [key: string]: any;
  };
  index: number;
}

export const BaseballEventCard = memo(function BaseballEventCard({ event, index }: BaseballEventCardProps) {
  const { type, description, period, pitch, result, score, currentOuts } = event;

  // Get period badge styling
  const getPeriodBadgeClass = () => {
    if (!period) return 'bg-muted text-muted-foreground';
    if (period.toLowerCase().includes('top')) {
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
    if (period.toLowerCase().includes('bottom') || period.toLowerCase().includes('bot')) {
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    }
    return 'bg-muted text-muted-foreground';
  };

  // Get pitch type badge color
  const getPitchTypeClass = (pitchType?: string) => {
    if (!pitchType) return 'bg-muted';
    const type = pitchType.toUpperCase();
    switch (type) {
      case 'FASTBALL':
        return 'bg-red-500/20 text-red-400';
      case 'CURVE':
      case 'CURVEBALL':
        return 'bg-purple-500/20 text-purple-400';
      case 'SLIDER':
        return 'bg-blue-500/20 text-blue-400';
      case 'CHANGEUP':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // Render outs indicator
  const renderOuts = () => {
    if (currentOuts === undefined || currentOuts === null) return null;
    const outs = Math.min(currentOuts, 3);
    return (
      <div className="flex items-center gap-0.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={cn(
              'w-2 h-2 rounded-full',
              i < outs ? 'bg-destructive' : 'bg-muted'
            )}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">{outs} out{outs !== 1 ? 's' : ''}</span>
      </div>
    );
  };

  // Check if it's a scoring play
  const isScoringPlay = type?.toLowerCase().includes('score') || 
    type?.toLowerCase().includes('run') ||
    type?.toLowerCase().includes('home run') ||
    description?.toLowerCase().includes('scores');

  return (
    <div className={cn(
      'px-4 py-3',
      isScoringPlay && 'bg-green-500/5'
    )}>
      <div className="flex items-start gap-3">
        {/* Period badge */}
        {period && (
          <div className={cn(
            'px-2 py-1 rounded text-xs font-medium border shrink-0',
            getPeriodBadgeClass()
          )}>
            {period}
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Type and description */}
          <div className="flex items-center gap-2 mb-1">
            {type && type !== 'Start Inning' && (
              <span className="text-xs font-medium text-primary">{type}</span>
            )}
          </div>
          
          {description && (
            <p className="text-sm text-foreground mb-2">{description}</p>
          )}

          {/* Pitch info */}
          {pitch && (pitch.type || pitch.velocity) && (
            <div className="flex items-center gap-2 mb-2">
              {pitch.type && (
                <span className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium',
                  getPitchTypeClass(pitch.type)
                )}>
                  {pitch.type}
                </span>
              )}
              {pitch.velocity && (
                <span className="text-xs text-muted-foreground">
                  {pitch.velocity.toFixed(1)} mph
                </span>
              )}
            </div>
          )}

          {/* Count and outs */}
          <div className="flex items-center gap-4">
            {result && (result.ballsCount !== undefined || result.strikesCount !== undefined) && (
              <div className="text-xs text-muted-foreground">
                Count: {result.ballsCount ?? 0}-{result.strikesCount ?? 0}
              </div>
            )}
            {renderOuts()}
          </div>
        </div>

        {/* Score */}
        {score && (score.away !== undefined || score.home !== undefined) && (
          <div className="text-right shrink-0">
            <div className="text-xs text-muted-foreground mb-0.5">Score</div>
            <div className="font-bold text-sm">
              {score.away ?? 0} - {score.home ?? 0}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
