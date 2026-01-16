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
}) => {
  const navigate = useNavigate();
  const colorOrder: (keyof typeof LUDO_BORDER_COLORS)[] = ['red', 'green', 'yellow', 'blue'];
  const isFree = !bet_amount || bet_amount === 0;

  const handleClick = () => {
    navigate(`/games/ludo/${id}`);
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={handleClick}
      className="w-full p-4 rounded-2xl bg-card border border-border hover:border-primary/40 hover:bg-accent/30 transition-all duration-200 group text-left"
    >
      {/* Header: Room code + Badge + Arrow */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-foreground">#{room_code}</span>
          <span className="text-xs text-muted-foreground">
            {players.length}/{max_players}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isFree ? (
            <Badge variant="secondary" className="text-[10px] font-semibold px-2 py-0.5">
              FREE
            </Badge>
          ) : (
            <Badge className="text-[10px] font-semibold px-2 py-0.5 bg-ludo-yellow/20 text-ludo-yellow border-ludo-yellow/30">
              ${bet_amount}
            </Badge>
          )}
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>

      {/* Player Avatars with colored borders */}
      <div className="flex items-center gap-3">
        {colorOrder.slice(0, max_players).map((color) => {
          const player = players.find(p => p.color === color);

          return player ? (
            <motion.div
              key={color}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 + 0.1 }}
              className="flex flex-col items-center gap-1.5"
            >
              {/* Avatar with gradient border */}
              <div className={`p-[2px] rounded-full ${LUDO_BORDER_COLORS[color]}`}>
                <Avatar className="h-9 w-9 border-2 border-background">
                  <AvatarImage src={player.user?.avatar_url} alt={player.user?.username} />
                  <AvatarFallback className="bg-muted text-[10px] font-semibold">
                    {getInitials(player.user?.username)}
                  </AvatarFallback>
                </Avatar>
              </div>
              {/* Username */}
              <span className="text-[9px] text-muted-foreground truncate max-w-[48px] leading-none">
                {player.user?.username ? `@${player.user.username}` : 'Player'}
              </span>
            </motion.div>
          ) : (
            <motion.div
              key={color}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 + 0.1 }}
              className="flex flex-col items-center gap-1.5"
            >
              {/* Empty slot with dashed border */}
              <div className={`p-[2px] rounded-full ${LUDO_BORDER_COLORS[color]} opacity-30`}>
                <div className="h-9 w-9 rounded-full border-2 border-dashed border-muted-foreground/40 bg-background flex items-center justify-center">
                  <Plus className="w-3.5 h-3.5 text-muted-foreground/50" />
                </div>
              </div>
              {/* Open label */}
              <span className="text-[9px] text-muted-foreground/40 leading-none">
                Open
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.button>
  );
};

export const LudoRoomCardSkeleton: React.FC = () => (
  <div className="p-4 rounded-2xl bg-card border border-border animate-pulse">
    {/* Header skeleton */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="h-4 w-16 bg-muted rounded" />
        <div className="h-3 w-8 bg-muted rounded" />
      </div>
      <div className="h-5 w-12 bg-muted rounded-full" />
    </div>

    {/* Avatars skeleton */}
    <div className="flex items-center gap-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5">
          <div className="h-9 w-9 rounded-full bg-muted" />
          <div className="h-2 w-8 bg-muted rounded" />
        </div>
      ))}
    </div>
  </div>
);
