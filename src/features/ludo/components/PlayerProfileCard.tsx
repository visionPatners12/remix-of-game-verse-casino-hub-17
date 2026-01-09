import React from 'react';
import { cn } from '@/lib/utils';

interface Player {
  id: string;
  user_id: string;
  color: string;
  position: number;
  is_ready: boolean;
  is_connected: boolean;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
}

interface PlayerProfileCardProps {
  player?: Player;
  color: 'R' | 'G' | 'Y' | 'B';
  isCurrentTurn: boolean;
  className?: string;
  reverse?: boolean;
}

const COLOR_CONFIG = {
  R: {
    name: 'Red',
    text: 'text-red-400',
    ring: 'ring-red-500',
    avatarBg: 'bg-red-500',
    border: 'border-red-500',
    glow: 'shadow-[0_0_12px_rgba(239,68,68,0.6)]',
  },
  G: {
    name: 'Green',
    text: 'text-green-400',
    ring: 'ring-green-500',
    avatarBg: 'bg-green-500',
    border: 'border-green-500',
    glow: 'shadow-[0_0_12px_rgba(34,197,94,0.6)]',
  },
  Y: {
    name: 'Yellow',
    text: 'text-yellow-400',
    ring: 'ring-yellow-500',
    avatarBg: 'bg-yellow-500',
    border: 'border-yellow-500',
    glow: 'shadow-[0_0_12px_rgba(234,179,8,0.6)]',
  },
  B: {
    name: 'Blue',
    text: 'text-blue-400',
    ring: 'ring-blue-500',
    avatarBg: 'bg-blue-500',
    border: 'border-blue-500',
    glow: 'shadow-[0_0_12px_rgba(59,130,246,0.6)]',
  },
};

export const PlayerProfileCard: React.FC<PlayerProfileCardProps> = ({
  player,
  color,
  isCurrentTurn,
  className,
  reverse = false,
}) => {
  const config = COLOR_CONFIG[color];
  
  const getInitials = () => {
    if (player?.username) return player.username.slice(0, 2).toUpperCase();
    if (player?.first_name) return player.first_name.slice(0, 1).toUpperCase();
    return config.name.slice(0, 1);
  };

  const getName = () => {
    if (player?.username) return player.username;
    if (player?.first_name) return player.first_name;
    return config.name;
  };

  // Avatar component
  const Avatar = () => (
    <div className={cn(
      "relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0",
      "border-2 transition-all duration-300",
      config.border,
      isCurrentTurn && [
        "ring-2 ring-offset-1 ring-offset-background",
        config.ring,
        config.glow,
      ]
    )}>
      {player?.avatar_url ? (
        <img 
          src={player.avatar_url} 
          alt={getName()}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className={cn("w-full h-full flex items-center justify-center", config.avatarBg)}>
          <span className="text-sm font-bold text-white">
            {getInitials()}
          </span>
        </div>
      )}
      
      {/* Active indicator */}
      {isCurrentTurn && (
        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border border-background animate-ping" />
      )}
    </div>
  );

  // Name component - show full name
  const Name = () => (
    <span className={cn(
      "text-xs font-semibold whitespace-nowrap transition-all duration-300",
      config.text,
      isCurrentTurn && "text-sm font-bold"
    )}>
      {getName()}
    </span>
  );

  if (!player) {
    return (
      <div className={cn(
        "flex items-center gap-2 opacity-40",
        reverse && "flex-row-reverse",
        className
      )}>
        <div className={cn(
          "w-9 h-9 rounded-full border-2 border-dashed flex items-center justify-center",
          config.border,
        )}>
          <span className={cn("text-sm font-bold", config.text)}>?</span>
        </div>
        <span className="text-xs text-muted-foreground">Waiting</span>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-2 transition-all duration-300",
      reverse && "flex-row-reverse",
      isCurrentTurn && "scale-105",
      className
    )}>
      <Avatar />
      <Name />
    </div>
  );
};