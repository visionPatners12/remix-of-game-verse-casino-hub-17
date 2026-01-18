import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useActiveLudoGames } from '../hooks/useActiveLudoGames';
import { useUserActiveGame } from '../hooks/useUserActiveGame';
import { useUserPastGames } from '../hooks/useUserPastGames';
import { useAuth } from '@/hooks/useAuth';
import { LudoStatusBar } from './LudoStatusBar';
import { LudoActionCards } from './LudoActionCards';
import { LudoRoomsList } from './LudoRoomsList';
import { LudoHistoryAccordion } from './LudoHistoryAccordion';
import { ActiveGameBanner } from '../components/ActiveGameBanner';

const LudoGamesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;

  const { games, loading, refetch } = useActiveLudoGames();
  const { activeGame, loading: activeLoading } = useUserActiveGame(userId);
  const { games: pastGames, loading: loadingPast } = useUserPastGames(userId);

  // Filter games - show only games user hasn't joined
  const availableGames = React.useMemo(() => {
    if (!userId) return games;
    return games.filter(game => 
      !game.players.some(p => p.user_id === userId)
    );
  }, [games, userId]);

  // Calculate stats
  const totalPlayers = React.useMemo(() => {
    const uniqueUsers = new Set<string>();
    games.forEach(game => {
      game.players.forEach(p => {
        if (p.user_id) uniqueUsers.add(p.user_id);
      });
    });
    return uniqueUsers.size;
  }, [games]);

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header 
        className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center justify-between px-4 h-14">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/games')}
            className="w-9 h-9"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <h1 className="text-lg font-bold text-foreground">Ludo</h1>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-9 h-9"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </header>

      {/* Status Bar */}
      <LudoStatusBar 
        onlineCount={totalPlayers || 0} 
        liveGames={games.length} 
      />

      {/* Main Content */}
      <main className="p-4 space-y-6">
        {/* Active Game Banner */}
        {!activeLoading && activeGame && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ActiveGameBanner 
              gameId={activeGame.id}
              gameName={activeGame.game_name}
              status={activeGame.status}
            />
          </motion.div>
        )}

        {/* Action Cards - Create + Join */}
        <LudoActionCards />

        {/* Open Rooms List */}
        <LudoRoomsList 
          rooms={availableGames.map(g => ({
            id: g.id,
            room_code: g.room_code || '',
            max_players: g.max_players || 4,
            bet_amount: (g as any).bet_amount ?? null,
            pot: (g as any).pot ?? null,
            players: g.players.map(p => {
              // Map DB color enum (R, G, Y, B) to display color (red, green, yellow, blue)
              const colorMap: Record<string, 'red' | 'green' | 'yellow' | 'blue'> = {
                'R': 'red',
                'G': 'green', 
                'Y': 'yellow',
                'B': 'blue'
              };
              return {
                id: p.id,
                color: colorMap[p.color] || 'red',
                user: p.users
              };
            })
          }))}
          loading={loading} 
        />

        {/* History Accordion */}
        <LudoHistoryAccordion 
          games={pastGames} 
          loading={loadingPast}
          userId={userId}
        />
      </main>
    </div>
  );
};

export default LudoGamesPage;
