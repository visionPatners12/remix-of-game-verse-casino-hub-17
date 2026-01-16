import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useActiveLudoGames } from '../hooks/useActiveLudoGames';
import { useUserActiveGame } from '../hooks/useUserActiveGame';
import { useUserPastGames } from '../hooks/useUserPastGames';
import { useAuth } from '@/hooks/useAuth';
import { ActiveGameBanner } from '../components/ActiveGameBanner';
import { PastGameCard } from '../components/PastGameCard';
import { LudoHeroSection } from './LudoHeroSection';
import { LudoQuickActions } from './LudoQuickActions';
import { LudoPlayOnlineCard } from './LudoPlayOnlineCard';
import { LudoGameCard, LudoGameCardSkeleton } from './LudoGameCard';
import { LudoEmptyState } from './LudoEmptyState';
import { Button } from '@/components/ui/button';
import { RotateCcw, ArrowLeft, Gamepad2, History, Users } from 'lucide-react';
import { toast } from 'sonner';

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

// Tab Button Component
const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count: number;
  icon: React.ElementType;
}> = ({ active, onClick, children, count, icon: Icon }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium rounded-xl transition-all duration-200 ${
      active
        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
    }`}
  >
    <Icon className="w-4 h-4" />
    {children}
    <span className={`px-1.5 py-0.5 rounded-md text-xs font-semibold ${
      active ? 'bg-primary-foreground/20' : 'bg-muted text-muted-foreground'
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
  const activeGamesCount = games.filter(g => g.status === 'active').length;
  const totalPlayers = games.reduce((acc, g) => acc + g.players.length, 0);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Gamepad2 className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Loading error</h2>
          <p className="text-muted-foreground text-sm mb-4">Failed to load games</p>
          <Button onClick={() => refetch()} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header 
        className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50" 
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/games')}
            className="shrink-0 rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              refetch();
              toast.success("Refreshed");
            }}
            disabled={loading}
            className="shrink-0 rounded-xl"
          >
            <RotateCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-4 pb-8">
        {/* Hero Section */}
        <LudoHeroSection 
          activeGamesCount={activeGamesCount} 
          totalPlayers={totalPlayers || 127} 
        />

        {/* Active Game Banner */}
        {!activeLoading && activeGame && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ActiveGameBanner
              gameId={activeGame.id}
              gameName={activeGame.game_name}
              status={activeGame.status}
            />
          </motion.div>
        )}

        {/* Quick Actions - Create + Join */}
        <LudoQuickActions />

        {/* Play Online Coming Soon */}
        <LudoPlayOnlineCard />

        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-2 p-1.5 bg-muted/30 rounded-xl border border-border/50"
        >
          <TabButton
            active={activeTab === 'available'}
            onClick={() => setActiveTab('available')}
            count={availableGames.length}
            icon={Users}
          >
            Available
          </TabButton>
          <TabButton
            active={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
            count={pastGames.length}
            icon={History}
          >
            History
          </TabButton>
        </motion.div>

        {/* Games List */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          {activeTab === 'history' ? (
            // History tab content
            loadingPast ? (
              [...Array(3)].map((_, i) => <LudoGameCardSkeleton key={i} />)
            ) : pastGames.length === 0 ? (
              <LudoEmptyState type="history" />
            ) : (
              pastGames.map((game) => (
                <PastGameCard key={game.id} game={game} />
              ))
            )
          ) : (
            // Available games tab content
            loading ? (
              [...Array(3)].map((_, i) => <LudoGameCardSkeleton key={i} />)
            ) : availableGames.length === 0 ? (
              <LudoEmptyState type="available" />
            ) : (
              availableGames.map((game, index) => (
                <LudoGameCard key={game.id} game={game} index={index} />
              ))
            )
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LudoGamesPage;
