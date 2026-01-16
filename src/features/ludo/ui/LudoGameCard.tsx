import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Clock, Coins, Trophy, Plus, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AvatarFallback } from '@/components/ui/avatar-fallback';
import { toast } from 'sonner';

// Ludo color mapping
const LUDO_COLORS = {
  R: { bg: 'bg-ludo-red', border: 'border-ludo-red', hex: '#EF4444' },
  G: { bg: 'bg-ludo-green', border: 'border-ludo-green', hex: '#22C55E' },
  Y: { bg: 'bg-ludo-yellow', border: 'border-ludo-yellow', hex: '#EAB308' },
  B: { bg: 'bg-ludo-blue', border: 'border-ludo-blue', hex: '#3B82F6' },
} as const;

interface Player {
  id: string;
  user_id: string;
  color: keyof typeof LUDO_COLORS;
  turn_order: number;
  is_ready: boolean;
  is_connected: boolean;
  users: {
    username: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
  } | null;
}

interface LudoGameCardProps {
  game: {
    id: string;
    game_name: string;
    status: string;
    current_players: number;
    max_players: number;
    room_code: string;
    turn: string;
    created_at: string;
    bet_amount?: string | number;
    players: Player[];
  };
  index?: number;
}

export const LudoGameCard: React.FC<LudoGameCardProps> = ({ game, index = 0 }) => {
  const navigate = useNavigate();
  const playerCount = game.players.length;
  const maxPlayers = game.max_players;
  const isActive = game.status === 'active';
  const isFull = playerCount >= maxPlayers;
  
  const betAmount = game.bet_amount ? parseFloat(String(game.bet_amount)) : 0;
  const prizePool = betAmount * playerCount;
  
  const handleClick = () => {
    if (isFull && !game.players.some(p => p.user_id)) {
      toast.error("This game is full");
      return;
    }
    navigate(`/games/ludo/play/${game.id}`);
  };

  const timeAgo = new Date(game.created_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const emptySlots = Math.max(0, maxPlayers - playerCount);

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.05 }}
      onClick={handleClick}
      className="w-full text-left group relative overflow-hidden rounded-xl bg-card border border-border p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.99]"
    >
      {/* Live indicator glow */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-success/5 to-transparent pointer-events-none" />
      )}
      
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground truncate max-w-[140px]">
            {game.game_name || `Game #${game.room_code}`}
          </span>
          {isActive && (
            <Badge variant="default" className="bg-success/20 text-success border-0 text-[10px] px-1.5 py-0 h-5">
              <span className="relative flex h-1.5 w-1.5 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
              </span>
              LIVE
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {timeAgo}
        </div>
      </div>

      {/* Players Row */}
      <div className="flex items-center justify-between mb-3">
        {/* Avatar Stack */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {game.players.slice(0, 4).map((player) => {
              const displayName = player.users?.username || player.users?.first_name || `P${player.turn_order}`;
              const colorStyle = LUDO_COLORS[player.color] || LUDO_COLORS.B;
              
              return (
                <div
                  key={player.id}
                  className={`relative w-8 h-8 rounded-full border-2 ${colorStyle.border} bg-background overflow-hidden ring-2 ring-background`}
                >
                  {player.users?.avatar_url ? (
                    <img
                      src={player.users.avatar_url}
                      alt={displayName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <AvatarFallback 
                      name={displayName} 
                      size="sm" 
                      variant="user" 
                      className="w-full h-full text-[10px]" 
                    />
                  )}
                  
                  {/* Connected indicator */}
                  {player.is_connected && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-background" />
                  )}
                </div>
              );
            })}
            
            {/* Empty slots */}
            {Array.from({ length: Math.min(emptySlots, 2) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground/30 bg-muted/20 flex items-center justify-center ring-2 ring-background"
              >
                <Plus className="w-3 h-3 text-muted-foreground/50" />
              </div>
            ))}
          </div>
          
          {/* Player count badge */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/50">
            <Users className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">{playerCount}/{maxPlayers}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(playerCount / maxPlayers) * 100}%` }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
          />
        </div>
      </div>

      {/* Footer Row */}
      <div className="flex items-center justify-between">
        {/* Room code */}
        <span className="font-mono text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
          #{game.room_code}
        </span>
        
        {/* Bet & Prize OR Free badge */}
        <div className="flex items-center gap-3">
          {betAmount <= 0 ? (
            <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-semibold text-xs">
              FREE
            </Badge>
          ) : (
            <>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Coins className="w-3 h-3" />
                <span>${betAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-amber-400">
                <Trophy className="w-3 h-3" />
                <span>${prizePool.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
        
        {/* Action button */}
        <div className="flex items-center gap-1 text-primary text-sm font-semibold group-hover:translate-x-0.5 transition-transform">
          {isActive ? 'Resume' : 'Join'}
          <Play className="w-3.5 h-3.5 fill-current" />
        </div>
      </div>
    </motion.button>
  );
};

// Skeleton loader
export const LudoGameCardSkeleton: React.FC = () => (
  <div className="w-full rounded-xl bg-card border border-border p-4 animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="h-5 w-32 bg-muted rounded" />
      <div className="h-4 w-16 bg-muted rounded" />
    </div>
    <div className="flex items-center justify-between mb-3">
      <div className="flex -space-x-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-8 h-8 rounded-full bg-muted ring-2 ring-background" />
        ))}
      </div>
      <div className="w-16 h-1.5 bg-muted rounded-full" />
    </div>
    <div className="flex items-center justify-between">
      <div className="h-4 w-16 bg-muted rounded" />
      <div className="h-4 w-24 bg-muted rounded" />
      <div className="h-4 w-12 bg-muted rounded" />
    </div>
  </div>
);
