import React from 'react';
import { motion } from 'framer-motion';
import { Users, Gamepad2, Zap } from 'lucide-react';

interface LudoHeroSectionProps {
  activeGamesCount: number;
  totalPlayers: number;
}

export const LudoHeroSection: React.FC<LudoHeroSectionProps> = ({ 
  activeGamesCount, 
  totalPlayers 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 border border-primary/20 p-6"
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-4 left-4 w-8 h-8 rounded-lg bg-ludo-red/30 rotate-12 animate-pulse" />
        <div className="absolute top-8 right-8 w-6 h-6 rounded-lg bg-ludo-blue/30 -rotate-6 animate-pulse" style={{ animationDelay: '0.2s' }} />
        <div className="absolute bottom-6 left-1/4 w-5 h-5 rounded-lg bg-ludo-green/30 rotate-45 animate-pulse" style={{ animationDelay: '0.4s' }} />
        <div className="absolute bottom-4 right-1/3 w-7 h-7 rounded-lg bg-ludo-yellow/30 -rotate-12 animate-pulse" style={{ animationDelay: '0.6s' }} />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex items-center gap-4">
        {/* Ludo Icon */}
        <div className="relative">
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.02, 1]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-ludo-red via-ludo-blue to-ludo-green p-[2px]"
          >
            <div className="w-full h-full rounded-2xl bg-background flex items-center justify-center">
              <img 
                src="/ludo-logo.png" 
                alt="Ludo" 
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </motion.div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl -z-10" />
        </div>
        
        {/* Title & Stats */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground mb-2">Ludo</h1>
          
          {/* Live stats */}
          <div className="flex items-center gap-4">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-1.5"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
              </span>
              <span className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{totalPlayers}</span> online
              </span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-1.5 text-sm text-muted-foreground"
            >
              <Gamepad2 className="w-3.5 h-3.5 text-primary" />
              <span className="font-semibold text-foreground">{activeGamesCount}</span> games
            </motion.div>
          </div>
        </div>
        
        {/* Decorative badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20"
        >
          <Zap className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">LIVE</span>
        </motion.div>
      </div>
    </motion.div>
  );
};
