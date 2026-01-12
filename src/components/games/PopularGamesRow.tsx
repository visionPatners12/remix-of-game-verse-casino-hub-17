import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface PopularGame {
  id: string;
  name: string;
  emoji?: string;
  image?: string;
  gradient: string;
  playersOnline?: number;
  isLive?: boolean;
}

const POPULAR_GAMES: PopularGame[] = [
  { id: 'ludo', name: 'Ludo', emoji: '', gradient: 'from-emerald-500 to-teal-600', playersOnline: 127, isLive: true, image: '/ludo-logo.png' },
  { id: 'crash', name: 'Crash', emoji: '📈', gradient: 'from-orange-500 to-red-600', playersOnline: 89 },
  { id: 'dice', name: 'Dice', emoji: '🎯', gradient: 'from-violet-500 to-purple-600', playersOnline: 45 },
  { id: 'plinko', name: 'Plinko', emoji: '🔮', gradient: 'from-pink-500 to-rose-600', playersOnline: 34 },
];

export const PopularGamesRow: React.FC = () => {
  const navigate = useNavigate();

  const handleGameClick = (game: PopularGame) => {
    if (game.id === 'ludo') {
      navigate('/games/ludo');
    } else {
      toast.info(`${game.name} coming soon!`, {
        description: 'This game will be available soon.',
      });
    }
  };

  return (
    <section className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <Flame className="w-4 h-4 text-orange-500" />
        <h3 className="text-sm font-bold text-foreground">Popular Games</h3>
      </div>

      {/* Games Grid - 4 columns */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {POPULAR_GAMES.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleGameClick(game)}
            className={cn(
              'relative aspect-square rounded-xl overflow-hidden cursor-pointer',
              'bg-gradient-to-br',
              game.gradient,
              'border border-border/30',
              'hover:shadow-xl hover:shadow-primary/20 transition-shadow duration-300',
              'group'
            )}
          >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Badge */}
            <Badge className={cn(
              "absolute top-1.5 right-1.5 text-[8px] px-1.5 py-0 h-4 font-bold border-0",
              game.isLive 
                ? "bg-emerald-500 text-white animate-pulse" 
                : "bg-black/70 text-white"
            )}>
              {game.isLive ? 'LIVE' : 'SOON'}
            </Badge>

            {/* Image or Emoji */}
            <div className="absolute inset-0 flex items-center justify-center p-2">
              {game.image ? (
                <motion.img
                  src={game.image}
                  alt={game.name}
                  className="w-full h-full object-contain drop-shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                />
              ) : (
                <motion.span
                  className="text-3xl sm:text-4xl drop-shadow-lg"
                  whileHover={{ scale: 1.2, rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.3 }}
                >
                  {game.emoji}
                </motion.span>
              )}
            </div>

            {/* Shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />

            {/* Game name */}
            <div className="absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-black/90 to-transparent">
              <p className="text-white font-bold text-[10px] sm:text-xs text-center truncate">
                {game.name}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
