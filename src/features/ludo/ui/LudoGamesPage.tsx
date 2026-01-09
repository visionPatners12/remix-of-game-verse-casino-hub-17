import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveLudoGames } from '../hooks/useActiveLudoGames';
import { useJoinGameByCode } from '../hooks/useJoinGameByCode';
import { useUserActiveGame } from '../hooks/useUserActiveGame';
import { useUserPastGames } from '../hooks/useUserPastGames';
import { useAuth } from '@/hooks/useAuth';
import { ActiveGameBanner } from '../components/ActiveGameBanner';
import { PastGameCard } from '../components/PastGameCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AvatarFallback } from '@/components/ui/avatar-fallback';
import { Users, Play, Plus, RotateCcw, Clock, Gamepad2, Coins, Hash, ArrowLeft, Trophy, History } from 'lucide-react';
import { toast } from 'sonner';

// Color mapping utility
const getColorValue = (colorCode: string): string => {
  const colors = {
    R: '#EF4444',
    G: '#16A34A',
    Y: '#EAB308',
    B: '#3B82F6'
  };
  return colors[colorCode as keyof typeof colors] || '#64748B';
};

// Filter games into available and my games
const filterGames = (games: any[], userId: string | undefined) => {
  if (!userId) {
    return { myGames: [], availableGames: games };
  }
  
  const myGames = games.filter(game => 
    game.players.some((p: any) => p.user_id === userId)
  );
  
  const availableGames = games.filter(game => 
    !myGames.includes(game) && 
    game.current_players < game.max_players
  );
  
  return { myGames, availableGames };
};

// Game Card Interface
interface GameCardProps {
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
    players: Array<{
      id: string;
      user_id: string;
      color: string;
      turn_order: number;
      is_ready: boolean;
      is_connected: boolean;
      users: {
        username: string;
        first_name: string;
        last_name: string;
        avatar_url: string;
      } | null;
    }>;
  };
}

// Native Game Card - No background, separated by lines
const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const navigate = useNavigate();
  const playerCount = game.players.length;
  const maxPlayers = game.max_players;
  const isActive = game.status === 'active';
  
  const betAmount = game.bet_amount ? parseFloat(String(game.bet_amount)) : 0;
  const prizePool = betAmount * playerCount;
  
  const handleJoinGame = () => {
    if (playerCount >= maxPlayers) {
      toast.error("This game is full");
      return;
    }
    navigate(`/games/ludo/play/${game.id}`);
  };

  const timeAgo = new Date(game.created_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <button
      onClick={handleJoinGame}
      className="w-full text-left py-4 transition-all duration-200 active:opacity-70"
    >
      {/* Top Row - Game name, status, time */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">
            {game.game_name || `Game #${game.room_code}`}
          </span>
          {isActive && (
            <Badge variant="default" className="bg-success/20 text-success border-0 text-xs px-1.5 py-0">
              Live
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {timeAgo}
        </div>
      </div>

      {/* Middle Row - Players and bet info */}
      <div className="flex items-center justify-between mb-3">
        {/* Players */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {game.players.slice(0, 4).map((player) => {
              const displayName = player.users?.username || player.users?.first_name || `P${player.turn_order}`;
              
              return (
                <div
                  key={player.id}
                  className="w-7 h-7 rounded-full border-2 border-background overflow-hidden"
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
                    <AvatarFallback name={displayName} size="sm" variant="user" className="w-full h-full text-[10px]" />
                  )}
                </div>
              );
            })}
            
            {/* Empty slots */}
            {Array.from({ length: Math.min(maxPlayers - playerCount, 2) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="w-7 h-7 rounded-full border-2 border-dashed border-muted-foreground/30 bg-muted/10 flex items-center justify-center"
              >
                <Plus className="w-2.5 h-2.5 text-muted-foreground/50" />
              </div>
            ))}
          </div>
          
          <span className="text-sm text-muted-foreground">
            {playerCount}/{maxPlayers}
          </span>
        </div>

        {/* Bet & Prize Pool - Always visible */}
        <div className="flex items-center gap-4">
          {betAmount <= 0 ? (
            <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-500 border-0 font-semibold">
              FREE
            </Badge>
          ) : (
            <>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Coins className="w-3.5 h-3.5" />
                <span className="text-xs">
                  Bet: <span className="font-medium text-foreground">${betAmount.toFixed(2)}</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-500">
                <Trophy className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">
                  Pool: ${prizePool.toFixed(2)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Row - Room code and action */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground">#{game.room_code}</span>
        
        <div className="flex items-center gap-1 text-primary text-sm font-medium">
          {isActive ? 'Resume' : 'Join'}
          <Play className="w-3.5 h-3.5" />
        </div>
      </div>
    </button>
  );
};

// Loading skeleton
const GameCardSkeleton: React.FC = () => (
  <div className="py-4 border-b border-border">
    <div className="flex items-center justify-between mb-3">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-4 w-16" />
    </div>
    <div className="flex items-center justify-between mb-3">
      <div className="flex -space-x-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="w-7 h-7 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-4 w-20" />
    </div>
    <div className="flex justify-between">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-4 w-12" />
    </div>
  </div>
);

// Room Code Input
const RoomCodeInput: React.FC = () => {
  const [roomCode, setRoomCode] = useState('');
  const { joinGame, isJoining } = useJoinGameByCode();

  const handleJoin = async () => {
    if (roomCode.trim()) {
      await joinGame(roomCode.trim());
    }
  };

  return (
    <div className="flex gap-2">
      <div className="flex-1 relative">
        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="CODE"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 6))}
          onKeyDown={(e) => e.key === 'Enter' && roomCode.length === 6 && handleJoin()}
          className="pl-9 font-mono tracking-widest text-center bg-muted/50 border-border"
          maxLength={6}
          disabled={isJoining}
        />
      </div>
      <Button
        onClick={handleJoin}
        disabled={roomCode.length !== 6 || isJoining}
        variant="secondary"
        className="px-6"
      >
        {isJoining ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          "OK"
        )}
      </Button>
    </div>
  );
};

// Tab Button Component
const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count: number;
}> = ({ active, onClick, children, count }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all duration-200 ${
      active
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
    }`}
  >
    {children}
    <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
      active ? 'bg-primary-foreground/20' : 'bg-muted'
    }`}>
      {count}
    </span>
  </button>
);

// Main Page Component
const LudoGamesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;
  const { games, loading, error, refetch } = useActiveLudoGames();
  const { activeGame, loading: activeLoading } = useUserActiveGame(userId);
  const { games: pastGames, loading: loadingPast } = useUserPastGames(userId);
  const [activeTab, setActiveTab] = useState<'available' | 'history'>('available');
  
  const { availableGames } = filterGames(games, userId);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <Gamepad2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Loading error</p>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Ludo</h1>
              <p className="text-xs text-muted-foreground">
                {games.filter(g => g.status === 'active').length} active games
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              refetch();
              toast.success("Refreshed");
            }}
            disabled={loading}
          >
            <RotateCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Active Game Banner */}
        {!activeLoading && activeGame && (
          <ActiveGameBanner
            gameId={activeGame.id}
            gameName={activeGame.game_name}
            status={activeGame.status}
          />
        )}

        {/* Create Game CTA */}
        <Button
          onClick={() => navigate('/games/ludo/create')}
          className="w-full h-14 text-base font-semibold"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Game
        </Button>

        {/* Room Code */}
        <RoomCodeInput />

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
          <TabButton
            active={activeTab === 'available'}
            onClick={() => setActiveTab('available')}
            count={availableGames.length}
          >
            Available
          </TabButton>
          <TabButton
            active={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
            count={pastGames.length}
          >
            History
          </TabButton>
        </div>

        {/* Games List - Native style with separators */}
        <div className="divide-y divide-border">
          {activeTab === 'history' ? (
            // History tab content
            loadingPast ? (
              [...Array(3)].map((_, i) => <GameCardSkeleton key={i} />)
            ) : pastGames.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">No game history yet</p>
              </div>
            ) : (
              pastGames.map((game) => (
                <PastGameCard key={game.id} game={game} />
              ))
            )
          ) : (
            // Available games tab content
            loading ? (
              [...Array(3)].map((_, i) => <GameCardSkeleton key={i} />)
            ) : availableGames.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">No games available</p>
              </div>
            ) : (
              availableGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default LudoGamesPage;
