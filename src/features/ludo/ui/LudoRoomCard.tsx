import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const LUDO_COLORS = {
  red: 'bg-ludo-red',
  green: 'bg-ludo-green',
  yellow: 'bg-ludo-yellow',
  blue: 'bg-ludo-blue',
} as const;

interface Player {
  id: string;
  color: keyof typeof LUDO_COLORS;
  user?: {
    username?: string;
    avatar_url?: string;
  };
}

interface LudoRoomCardProps {
  id: string;
  room_code: string;
  players: Player[];
  max_players: number;
  bet_amount: number | null;
  pot: number | null;
  index?: number;
}

export const LudoRoomCard: React.FC<LudoRoomCardProps> = ({
  id,
  room_code,
  players,
  max_players,
  bet_amount,
  pot,
  index = 0,
}) => {
  const navigate = useNavigate();
  const colorOrder: (keyof typeof LUDO_COLORS)[] = ['red', 'green', 'yellow', 'blue'];
  const isFree = !bet_amount || bet_amount === 0;

  const handleClick = () => {
    navigate(`/games/ludo/${id}`);
  };

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={handleClick}
      className="w-full flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/40 hover:bg-accent/50 transition-all duration-200 group"
    >
      {/* Color dots showing player slots */}
      <div className="flex items-center gap-1.5">
        {colorOrder.slice(0, max_players).map((color, i) => {
          const hasPlayer = players.some(p => p.color === color);
          return (
            <motion.div
              key={color}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 + i * 0.05 }}
              className={`w-3 h-3 rounded-full ${
                hasPlayer 
                  ? LUDO_COLORS[color] 
                  : 'border-2 border-dashed border-muted-foreground/30'
              }`}
            />
          );
        })}
      </div>

      {/* Room code */}
      <span className="flex-1 text-left font-mono text-sm font-medium text-foreground truncate">
        #{room_code}
      </span>

      {/* Player count */}
      <span className="text-xs text-muted-foreground font-medium">
        {players.length}/{max_players}
      </span>

      {/* Stake badge */}
      {isFree ? (
        <Badge variant="secondary" className="text-[10px] font-semibold px-2 py-0.5">
          FREE
        </Badge>
      ) : (
        <Badge className="text-[10px] font-semibold px-2 py-0.5 bg-ludo-yellow/20 text-ludo-yellow border-ludo-yellow/30">
          ${bet_amount}
        </Badge>
      )}

      {/* Arrow */}
      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
    </motion.button>
  );
};

export const LudoRoomCardSkeleton: React.FC = () => (
  <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border animate-pulse">
    <div className="flex gap-1.5">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="w-3 h-3 rounded-full bg-muted" />
      ))}
    </div>
    <div className="flex-1 h-4 bg-muted rounded" />
    <div className="w-8 h-4 bg-muted rounded" />
    <div className="w-12 h-5 bg-muted rounded-full" />
  </div>
);
