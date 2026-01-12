import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { HotBadge } from './HotBadge';
import { LivePlayersCount } from './LivePlayersCount';

interface GameData {
  id: string;
  name: string;
  emoji?: string;
  image?: string;
  gradient: string;
  isMock: boolean;
  isHot?: boolean;
  playersOnline?: number;
}

interface CompactGameCardProps {
  game: GameData;
  index: number;
  onClick: () => void;
}

export const CompactGameCard: React.FC<CompactGameCardProps> = ({ game, index, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.02, duration: 0.15 }}
      whileHover={{ scale: 1.05, y: -3 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        'relative aspect-square rounded-xl overflow-hidden cursor-pointer',
        'group transition-shadow duration-300',
        'hover:shadow-xl hover:shadow-primary/20',
        'bg-gradient-to-br',
        game.gradient,
        'border border-border/30'
      )}
    >
      {/* HOT Badge */}
      {game.isHot && !game.isMock && <HotBadge size="sm" />}

      {/* Image or emoji */}
      {game.image ? (
        <img
          src={game.image}
          alt={game.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="text-3xl drop-shadow-lg"
            whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.3 }}
          >
            {game.emoji}
          </motion.span>
        </div>
      )}

      {/* Dark overlay for mock games */}
      {game.isMock && <div className="absolute inset-0 bg-black/50" />}

      {/* SOON badge for mock games */}
      {game.isMock && (
        <Badge className="absolute top-1 right-1 text-[8px] px-1.5 py-0 h-4 font-bold bg-black/80 text-white border-0">
          SOON
        </Badge>
      )}

      {/* Shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />

      {/* Game name at bottom */}
      <div className="absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
        <p className="text-white font-bold text-[10px] text-center truncate drop-shadow-lg">
          {game.name}
        </p>
        {game.playersOnline && !game.isMock && (
          <div className="flex justify-center mt-0.5">
            <LivePlayersCount count={game.playersOnline} className="text-white/80" />
          </div>
        )}
      </div>
    </motion.div>
  );
};
