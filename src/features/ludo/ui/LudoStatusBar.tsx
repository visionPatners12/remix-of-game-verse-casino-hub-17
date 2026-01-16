import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2 } from 'lucide-react';

interface LudoStatusBarProps {
  onlineCount: number;
  liveGames: number;
}

export const LudoStatusBar: React.FC<LudoStatusBarProps> = ({ 
  onlineCount, 
  liveGames 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center gap-6 py-3 px-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-border/50"
    >
      {/* Online indicator */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
        </span>
        <span className="font-mono text-sm font-medium text-foreground">
          {onlineCount}
        </span>
        <span className="text-xs text-muted-foreground uppercase tracking-wide">
          online
        </span>
      </div>

      <span className="text-muted-foreground/30">•</span>

      {/* Live games */}
      <div className="flex items-center gap-2">
        <Gamepad2 className="w-3.5 h-3.5 text-primary" />
        <span className="font-mono text-sm font-medium text-foreground">
          {liveGames}
        </span>
        <span className="text-xs text-muted-foreground uppercase tracking-wide">
          live
        </span>
      </div>
    </motion.div>
  );
};
