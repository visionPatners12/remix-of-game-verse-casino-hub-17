import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const LUDO_BORDER_COLORS = {
  red: 'bg-gradient-to-br from-ludo-red to-ludo-red/70',
  green: 'bg-gradient-to-br from-ludo-green to-ludo-green/70',
  yellow: 'bg-gradient-to-br from-ludo-yellow to-ludo-yellow/70',
  blue: 'bg-gradient-to-br from-ludo-blue to-ludo-blue/70',
} as const;

interface Player {
  id: string;
  color: keyof typeof LUDO_BORDER_COLORS;
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
  isLast?: boolean;
}

const getInitials = (username?: string): string => {
  if (!username) return '?';
  return username.slice(0, 2).toUpperCase();
};

export const LudoRoomCard: React.FC<LudoRoomCardProps> = ({
  id,
  room_code,
  players,
  max_players,
  bet_amount,
  index = 0,
  isLast = false,
}) => {
  const navigate = useNavigate();
  const colorOrder: (keyof typeof LUDO_BORDER_COLORS)[] = ['red', 'green', 'yellow', 'blue'];
  const isFree = !bet_amount || bet_amount === 0;

  const handleClick = () => {
    navigate(`/games/ludo/play/${id}`);
  };

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={handleClick}
      className={`w-full py-3 flex items-center gap-3 hover:bg-accent/50 active:bg-accent transition-colors text-left -mx-4 px-4 ${
        !isLast ? 'border-b border-border' : ''
      }`}
    >
      {/* Player Avatars with colored borders */}
      <div className="flex items-center -space-x-2">
        {colorOrder.slice(0, max_players).map((color) => {
          const player = players.find(p => p.color === color);

          return player ? (
            <motion.div
              key={color}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.03 + 0.05 }}
              className={`p-[2px] rounded-full ${LUDO_BORDER_COLORS[color]} relative z-10`}
            >
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarImage src={player.user?.avatar_url} alt={player.user?.username} />
                <AvatarFallback className="bg-muted text-[9px] font-semibold">
                  {getInitials(player.user?.username)}
                </AvatarFallback>
              </Avatar>
            </motion.div>
          ) : (
            <motion.div
              key={color}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.03 + 0.05 }}
              className={`p-[2px] rounded-full ${LUDO_BORDER_COLORS[color]} opacity-25 relative`}
            >
              <div className="h-8 w-8 rounded-full border border-dashed border-muted-foreground/40 bg-background flex items-center justify-center">
                <Plus className="w-3 h-3 text-muted-foreground/40" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Room info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-foreground">#{room_code}</span>
          {isFree ? (
            <Badge variant="secondary" className="text-[9px] font-semibold px-1.5 py-0 h-4">
              FREE
            </Badge>
          ) : (
            <Badge className="text-[9px] font-semibold px-1.5 py-0 h-4 bg-ludo-yellow/20 text-ludo-yellow border-ludo-yellow/30">
              ${bet_amount}
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {players.length}/{max_players} players
        </span>
      </div>

      {/* Arrow */}
      <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
    </motion.button>
  );
};

export const LudoRoomCardSkeleton: React.FC = () => (
  <div className="py-3 flex items-center gap-3 border-b border-border -mx-4 px-4 animate-pulse">
    {/* Avatars skeleton */}
    <div className="flex items-center -space-x-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-8 w-8 rounded-full bg-muted border-2 border-background" />
      ))}
    </div>

    {/* Info skeleton */}
    <div className="flex-1 space-y-1.5">
      <div className="flex items-center gap-2">
        <div className="h-4 w-16 bg-muted rounded" />
        <div className="h-4 w-10 bg-muted rounded-full" />
      </div>
      <div className="h-3 w-20 bg-muted rounded" />
    </div>

    <div className="w-5 h-5 bg-muted rounded" />
  </div>
);
