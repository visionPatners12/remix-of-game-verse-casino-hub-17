import React, { useState, useEffect, useRef } from 'react';
import { LUDO_COLORS } from '../model/constants';

interface TurnTimerProps {
  turnStartedAt?: string;
  currentTurn?: string;
  turnDuration?: number;
  isCurrentTurn: boolean;
  onTimeExpired?: () => void;
}

export const TurnTimer: React.FC<TurnTimerProps> = ({
  turnStartedAt,
  currentTurn,
  turnDuration = 30,
  isCurrentTurn,
  onTimeExpired
}) => {
  const [remainingTime, setRemainingTime] = useState(turnDuration);
  const hasExpiredRef = useRef(false);

  // Get color based on current turn
  const getTurnColor = () => {
    switch (currentTurn) {
      case 'R': return LUDO_COLORS.RED;
      case 'G': return LUDO_COLORS.GREEN;
      case 'Y': return LUDO_COLORS.YELLOW;
      case 'B': return LUDO_COLORS.BLUE;
      default: return '#6b7280';
    }
  };

  // Reset expired flag when turn changes (new turnStartedAt)
  useEffect(() => {
    hasExpiredRef.current = false;
    setRemainingTime(turnDuration);
  }, [turnStartedAt, turnDuration]);

  // Countdown based on server time (turnStartedAt)
  useEffect(() => {
    if (!turnStartedAt) return;

    const interval = setInterval(() => {
      const start = new Date(turnStartedAt).getTime();
      const elapsed = (Date.now() - start) / 1000;
      const remaining = Math.max(0, Math.ceil(turnDuration - elapsed));
      setRemainingTime(remaining);

      // Trigger callback when timer expires (only once)
      if (remaining === 0 && onTimeExpired && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        onTimeExpired();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [turnStartedAt, turnDuration, onTimeExpired]);

  const percentage = (remainingTime / turnDuration) * 100;
  const isUrgent = remainingTime <= 10;
  const isCritical = remainingTime <= 5;
  const turnColor = getTurnColor();

  return (
    <div 
      className={`
        flex items-center gap-2 px-2.5 py-1.5 rounded-full
        bg-muted/50 backdrop-blur-sm border
        transition-all duration-300
        ${isCritical ? 'border-destructive bg-destructive/10 animate-pulse' : isUrgent ? 'border-orange-500/50 bg-orange-500/10' : 'border-border/30'}
      `}
    >
      {/* Circular progress with number inside */}
      <div className="relative w-7 h-7 flex-shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-muted/30"
          />
          <circle
            cx="18"
            cy="18"
            r="14"
            fill="none"
            stroke={isCritical ? 'hsl(var(--destructive))' : isUrgent ? '#f97316' : turnColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 0.88} 100`}
            className="transition-all duration-500"
          />
        </svg>
        <span 
          className={`
            absolute inset-0 flex items-center justify-center 
            text-[10px] font-bold tabular-nums
            ${isCritical ? 'text-destructive' : isUrgent ? 'text-orange-500' : 'text-foreground'}
          `}
        >
          {remainingTime}
        </span>
      </div>

      {/* Status label */}
      <span 
        className={`
          text-[10px] font-semibold uppercase tracking-wide
          ${isCritical ? 'text-destructive' : isUrgent ? 'text-orange-500' : 'text-muted-foreground'}
        `}
      >
        {isCurrentTurn ? 'Go!' : 'Wait'}
      </span>
    </div>
  );
};
