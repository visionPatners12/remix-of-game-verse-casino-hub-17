import React from 'react';
import { CheckCircle, Clock, Loader2, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface WaitingPlayer {
  id: string;
  user_id: string;
  color: string;
  username?: string;
  avatar_url?: string;
  has_deposited: boolean;
  deposit_status?: string;
}

interface WaitingPlayersListProps {
  players: WaitingPlayer[];
  maxPlayers?: number;
}

const COLOR_STYLES: Record<string, { bg: string; border: string; ring: string; name: string; glow: string }> = {
  R: { bg: 'bg-red-500', border: 'border-red-500', ring: 'ring-red-500', name: 'Red', glow: 'shadow-red-500/50' },
  G: { bg: 'bg-green-500', border: 'border-green-500', ring: 'ring-green-500', name: 'Green', glow: 'shadow-green-500/50' },
  Y: { bg: 'bg-yellow-500', border: 'border-yellow-500', ring: 'ring-yellow-500', name: 'Yellow', glow: 'shadow-yellow-500/50' },
  B: { bg: 'bg-blue-500', border: 'border-blue-500', ring: 'ring-blue-500', name: 'Blue', glow: 'shadow-blue-500/50' },
};

const SLOT_ORDER = ['R', 'G', 'Y', 'B'];

export const WaitingPlayersList: React.FC<WaitingPlayersListProps> = ({
  players,
  maxPlayers = 4,
}) => {
  const getPlayerByColor = (color: string) => {
    return players.find(p => p.color === color);
  };

  const readyCount = players.filter(p => p.has_deposited).length;

  const getInitials = (username?: string) => {
    if (!username) return '?';
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Players</h3>
        <span className="text-sm text-muted-foreground">
          {readyCount}/{players.length} ready
        </span>
      </div>

      <div className="space-y-2">
        {SLOT_ORDER.slice(0, maxPlayers).map((color, index) => {
          const player = getPlayerByColor(color);
          const colorStyle = COLOR_STYLES[color];
          const isReady = player?.has_deposited;

          return (
            <motion.div
              key={color}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-all",
                player 
                  ? "border-border/50 bg-card" 
                  : "border-dashed border-border/30 bg-muted/20"
              )}
            >
              {/* Avatar with animated ring for ready players */}
              {player ? (
                <div className="relative">
                  <Avatar className={cn(
                    "w-10 h-10 ring-2 transition-shadow",
                    colorStyle.ring,
                    isReady && `shadow-lg ${colorStyle.glow}`
                  )}>
                    <AvatarImage src={player.avatar_url} alt={player.username} />
                    <AvatarFallback className={cn(colorStyle.bg, "text-white font-medium")}>
                      {getInitials(player.username)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Animated pulse ring for ready players */}
                  {isReady && (
                    <motion.div
                      className={cn(
                        "absolute inset-0 rounded-full ring-2",
                        colorStyle.ring
                      )}
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 1.4, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </div>
              ) : (
                <motion.div 
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    "bg-muted/30 border-2 border-dashed",
                    colorStyle.border
                  )}
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <User className="w-5 h-5 text-muted-foreground/50" />
                </motion.div>
              )}

              {/* Player info */}
              {player ? (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {player.username || 'Player'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {colorStyle.name}
                    </p>
                  </div>

                  {/* Status - 3 states: confirmed, pending, waiting */}
                  {player.deposit_status === 'confirmed' || player.deposit_status === 'free' ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                    </motion.div>
                  ) : player.deposit_status === 'pending' ? (
                    <Loader2 className="w-5 h-5 text-orange-500 shrink-0 animate-spin" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-500 shrink-0 animate-pulse" />
                  )}
                </>
              ) : (
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Waiting for a player...
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    {colorStyle.name}
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
