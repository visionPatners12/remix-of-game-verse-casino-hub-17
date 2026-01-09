import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BetMode } from '../../../types';

interface ModernModeSelectorProps {
  mode: BetMode;
  onChange: (mode: BetMode) => void;
  className?: string;
}

const modes = [
  { id: 'REGULAR' as BetMode, label: 'Regular', icon: Layers, soon: false },
  { id: 'AGAINST_PLAYER' as BetMode, label: 'P2P', icon: Users, soon: true },
];

export function ModernModeSelector({ 
  mode, 
  onChange, 
  className 
}: ModernModeSelectorProps) {
  return (
    <div className={cn("flex items-center", className)}>
      {/* Mode Pills */}
      <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-xl">
        {modes.map((m) => {
          const isSelected = mode === m.id;
          const Icon = m.icon;
          
          return (
            <motion.button
              key={m.id}
              onClick={() => !m.soon && onChange(m.id)}
              whileTap={m.soon ? undefined : { scale: 0.95 }}
              disabled={m.soon}
              className={cn(
                "relative flex items-center gap-1.5 px-3 py-2 rounded-lg",
                "text-sm font-medium transition-colors",
                m.soon && "opacity-50 cursor-not-allowed",
                isSelected && !m.soon
                  ? "text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isSelected && !m.soon && (
                <motion.div
                  layoutId="mode-pill"
                  className="absolute inset-0 bg-primary rounded-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <Icon className={cn("relative h-4 w-4", isSelected && !m.soon && "z-10")} />
              <span className={cn("relative", isSelected && !m.soon && "z-10")}>{m.label}</span>
              {m.soon && (
                <span className="relative text-[10px] bg-muted px-1 py-0.5 rounded text-muted-foreground font-semibold">
                  SOON
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
