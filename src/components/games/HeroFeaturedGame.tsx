import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Flame, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useActivePlayers } from '@/hooks/useActivePlayers';

export const HeroFeaturedGame: React.FC = () => {
  const navigate = useNavigate();
  const { data: playersData } = useActivePlayers();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 16 }}
      whileHover={{ scale: 1.01 }}
      onClick={() => navigate('/games/ludo')}
      className={cn(
        "relative flex gap-4 p-4 rounded-2xl overflow-hidden cursor-pointer",
        "bg-card/60 backdrop-blur-xl",
        "border border-white/10",
        "hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10",
        "transition-all duration-300"
      )}
    >
      {/* Background glow effects */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-emerald-500/15 rounded-full blur-2xl" />
      
      {/* Shine sweep */}
      <motion.div
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: 'linear' }}
        className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 pointer-events-none"
      />

      {/* Game image */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-white/10">
        <img
          src="https://images.unsplash.com/photo-1611891487122-207579d67d98?w=400&h=400&fit=crop"
          alt="Ludo"
          className="w-full h-full object-cover"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between min-w-0 relative z-10">
        {/* Top: Badges */}
        <div className="flex items-center gap-1.5 mb-1">
          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 text-[10px] px-2 py-0.5 gap-1 shadow-lg shadow-orange-500/25">
            <Flame className="w-2.5 h-2.5" />
            HOT
          </Badge>
          <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] px-2 py-0.5 gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </Badge>
        </div>

        {/* Title */}
        <h2 className="text-lg sm:text-xl font-bold text-foreground truncate">Ludo</h2>
        
        {/* Description (hidden on very small screens) */}
        <p className="text-xs text-muted-foreground line-clamp-1 hidden xs:block">
          Classic board game, on-chain
        </p>

        {/* Bottom: Stats & CTA */}
        <div className="flex items-center justify-between gap-3 mt-2">
          <div className="flex items-center gap-1.5 text-xs">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold text-primary">{playersData?.ludoPlayers ?? 0}</span>
            <span className="text-muted-foreground">playing</span>
          </div>

          <Button
            size="sm"
            className="gap-1.5 h-8 text-xs shadow-lg shadow-primary/20"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/games/ludo');
            }}
          >
            <Play className="w-3.5 h-3.5" />
            Play Now
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
