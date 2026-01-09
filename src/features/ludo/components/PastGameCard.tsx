import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AvatarFallback } from '@/components/ui/avatar-fallback';
import { Trophy, Clock, Coins } from 'lucide-react';
import { PastGame } from '../hooks/useUserPastGames';

// Color mapping utility
const getColorValue = (colorCode: string): string => {
  const colors: Record<string, string> = {
    R: '#EF4444',
    G: '#16A34A',
    Y: '#EAB308',
    B: '#3B82F6'
  };
  return colors[colorCode] || '#64748B';
};

const getColorName = (colorCode: string): string => {
  const names: Record<string, string> = {
    R: 'Red',
    G: 'Green',
    Y: 'Yellow',
    B: 'Blue'
  };
  return names[colorCode] || colorCode;
};

interface PastGameCardProps {
  game: PastGame;
}

export const PastGameCard: React.FC<PastGameCardProps> = ({ game }) => {
  const betAmount = game.bet_amount ? parseFloat(String(game.bet_amount)) : 0;
  const pot = game.pot ? parseFloat(String(game.pot)) : 0;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const winnerDisplayName = game.winnerUser?.username || 
    (game.winner ? getColorName(game.winner) : 'Unknown');

  return (
    <div className="py-4">
      {/* Top Row - Game name + Win/Loss badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">
            {game.game_name || `Game #${game.room_code}`}
          </span>
          {game.userColor && (
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getColorValue(game.userColor) }}
            />
          )}
        </div>
        
        <Badge
          variant={game.isWinner ? 'default' : 'secondary'}
          className={game.isWinner 
            ? 'bg-amber-500/20 text-amber-500 border-0' 
            : 'bg-muted text-muted-foreground border-0'
          }
        >
          {game.isWinner ? (
            <>
              <Trophy className="w-3 h-3 mr-1" />
              Won
            </>
          ) : (
            'Lost'
          )}
        </Badge>
      </div>

      {/* Middle Row - Winner info + Prize */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-muted-foreground">
          {game.isWinner ? (
            <span className="text-amber-500 font-medium">You won!</span>
          ) : (
            <span>Winner: {winnerDisplayName}</span>
          )}
        </div>

        {/* Prize info */}
        {betAmount <= 0 ? (
          <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-500 border-0 text-xs">
            FREE
          </Badge>
        ) : game.isWinner ? (
          <div className="flex items-center gap-1 text-amber-500 font-semibold">
            <Coins className="w-3.5 h-3.5" />
            <span>+${pot.toFixed(2)}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <Coins className="w-3 h-3" />
            <span>-${betAmount.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Bottom Row - Date + Players */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{formatDate(game.finished_at)}</span>
        </div>

        {/* Player avatars */}
        <div className="flex -space-x-2">
          {game.players.slice(0, 4).map((player) => {
            const displayName = player.users?.username || player.users?.first_name || `P${player.turn_order}`;
            const isWinnerPlayer = game.winner_user_id === player.user_id;
            
            return (
              <div
                key={player.id}
                className={`w-6 h-6 rounded-full border-2 border-background overflow-hidden ${
                  isWinnerPlayer ? 'ring-2 ring-amber-500' : ''
                }`}
                style={{ borderColor: getColorValue(player.color) }}
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
                    className="w-full h-full text-[8px]" 
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
