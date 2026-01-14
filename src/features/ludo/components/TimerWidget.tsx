/**
 * Timer Widget - Premium circular countdown with animations
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LUDO_COLORS } from '../model/constants';

interface TimerWidgetProps {
  turnStartedAt?: string;
  currentTurn?: string;
  turnDuration?: number;
  isCurrentTurn: boolean;
  onTimeExpired?: () => void;
}

export const TimerWidget: React.FC<TimerWidgetProps> = ({
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

  // Reset expired flag when turn changes
  useEffect(() => {
    hasExpiredRef.current = false;
    setRemainingTime(turnDuration);
  }, [turnStartedAt, turnDuration]);

  // Countdown based on server time
  useEffect(() => {
    if (!turnStartedAt) return;

    const interval = setInterval(() => {
      const start = new Date(turnStartedAt).getTime();
      const elapsed = (Date.now() - start) / 1000;
      const remaining = Math.max(0, Math.ceil(turnDuration - elapsed));
      setRemainingTime(remaining);

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

  // Circle properties
  const size = 56;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      className={cn(
        "relative flex flex-col items-center gap-1 pointer-events-auto",
        isCritical && "animate-[shake_0.3s_ease-in-out_infinite]"
      )}
      animate={isCritical ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.3, repeat: isCritical ? Infinity : 0 }}
    >
      {/* Circular timer */}
      <div 
        className={cn(
          "relative flex items-center justify-center rounded-full",
          "bg-black/60 backdrop-blur-xl border-2 transition-all duration-300",
          isCritical 
            ? "border-destructive shadow-[0_0_20px_rgba(239,68,68,0.5)]" 
            : isUrgent 
              ? "border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]"
              : "border-white/10"
        )}
        style={{ 
          width: size, 
          height: size,
          boxShadow: !isCritical && !isUrgent ? `0 0 20px ${turnColor}40` : undefined
        }}
      >
        {/* Background glow */}
        <div 
          className="absolute inset-0 rounded-full opacity-20 blur-sm"
          style={{ backgroundColor: turnColor }}
        />
        
        {/* SVG Progress Ring */}
        <svg 
          className="absolute inset-0 -rotate-90" 
          width={size} 
          height={size}
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-white/10"
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={isCritical ? 'hsl(var(--destructive))' : isUrgent ? '#f97316' : turnColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500"
          />
        </svg>

        {/* Time display */}
        <span 
          className={cn(
            "relative z-10 font-bold tabular-nums",
            isCritical ? "text-destructive text-xl" : isUrgent ? "text-orange-500 text-xl" : "text-white text-lg"
          )}
        >
          {remainingTime}
        </span>
      </div>

      {/* Status badge */}
      <AnimatePresence mode="wait">
        {isCurrentTurn && (
          <motion.div
            key="your-turn"
            initial={{ opacity: 0, y: -5, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.8 }}
            className={cn(
              "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
              isCritical 
                ? "bg-destructive/20 text-destructive border border-destructive/30"
                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            )}
          >
            {isCritical ? "Hurry!" : "Your Turn"}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TimerWidget;
