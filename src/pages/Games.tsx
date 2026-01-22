import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Gamepad2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { HeroFeaturedGame } from '@/components/games/HeroFeaturedGame';
import { CategoriesTabs } from '@/components/games/CategoriesTabs';
import { PopularGamesRow } from '@/components/games/PopularGamesRow';
import { CompactGameCard } from '@/components/games/CompactGameCard';
import { CompactUpcomingCard } from '@/components/games/CompactUpcomingCard';
import { Trophy, Calendar, DollarSign, Globe, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Types
type GameCategory = 'popular' | 'multiplayer' | 'slots' | 'table' | 'instant';

interface MockGame {
  id: string;
  name: string;
  category: GameCategory[];
  emoji?: string;
  image?: string;
  gradient: string;
  isMock: boolean;
  isHot?: boolean;
  playersOnline?: number;
}

// All games data (excluding featured and popular which have their own sections)
const ALL_GAMES: MockGame[] = [
  // Real Ludo - shown in hero
  { id: 'ludo', name: 'Ludo', category: ['popular', 'multiplayer'], image: '/ludo-logo.png', gradient: 'from-emerald-500 to-cyan-500', isMock: false, isHot: true, playersOnline: 127 },
  
  // Slots
  { id: 'diamond-rush', name: 'Diamond Rush', category: ['slots'], emoji: '💎', gradient: 'from-cyan-400 to-blue-600', isMock: true },
  { id: 'lucky-7', name: 'Lucky 7', category: ['slots'], emoji: '🍀', gradient: 'from-green-400 to-emerald-600', isMock: true },
  { id: 'gold-rush', name: 'Gold Rush', category: ['slots'], emoji: '🏆', gradient: 'from-yellow-400 to-amber-600', isMock: true },
  
  // Table games
  { id: 'blackjack', name: 'Blackjack', category: ['table', 'multiplayer'], emoji: '🃏', gradient: 'from-slate-600 to-slate-800', isMock: true },
  { id: 'roulette', name: 'Roulette', category: ['table', 'popular'], emoji: '🔴', gradient: 'from-red-600 to-rose-800', isMock: true },
  { id: 'poker', name: 'Poker', category: ['table', 'multiplayer'], emoji: '♠️', gradient: 'from-indigo-600 to-blue-800', isMock: true },
  { id: 'baccarat', name: 'Baccarat', category: ['table'], emoji: '👑', gradient: 'from-amber-500 to-yellow-600', isMock: true },
  
  // Instant games
  { id: 'mines', name: 'Mines', category: ['instant'], emoji: '💣', gradient: 'from-gray-600 to-gray-800', isMock: true },
  { id: 'hilo', name: 'HiLo', category: ['instant', 'table'], emoji: '⬆️', gradient: 'from-sky-400 to-blue-600', isMock: true },
  { id: 'keno', name: 'Keno', category: ['instant'], emoji: '🎱', gradient: 'from-teal-500 to-cyan-600', isMock: true },
  { id: 'limbo', name: 'Limbo', category: ['instant'], emoji: '🌙', gradient: 'from-indigo-500 to-purple-700', isMock: true },
  
  // Multiplayer
  { id: 'chess', name: 'Chess', category: ['multiplayer'], emoji: '♟️', gradient: 'from-neutral-700 to-neutral-900', isMock: true },
  { id: 'domino', name: 'Domino', category: ['multiplayer'], emoji: '🁣', gradient: 'from-stone-500 to-stone-700', isMock: true },
];

export default function Games() {
  const navigate = useNavigate();
  const { t } = useTranslation('games');
  const [activeCategory, setActiveCategory] = useState('all');

  // Filter games by category
  const popularGameIds = ['ludo', 'crash', 'dice', 'plinko'];
  const gridGames = ALL_GAMES.filter(game => {
    // Skip popular games that are shown in their own row (except ludo which stays in All Games)
    if (popularGameIds.includes(game.id) && game.id !== 'ludo') return false;
    
    if (activeCategory === 'all') return true;
    return game.category.includes(activeCategory as GameCategory);
  });

  const handleGameClick = (game: MockGame) => {
    if (game.isMock) {
      toast.info(`${game.name} coming soon!`, {
        description: 'This game will be available soon.',
      });
    } else {
      navigate(`/games/${game.id}`);
    }
  };

  // Coming soon features data
  const tournamentsChips = [
    { icon: Calendar },
    { icon: DollarSign },
    { icon: Globe },
    { icon: Zap },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-3 py-4 max-w-6xl space-y-4">
        {/* 1. Categories - Top, always visible */}
        <CategoriesTabs 
          activeCategory={activeCategory} 
          onCategoryChange={setActiveCategory} 
        />

        {/* 2. Hero Featured Game - Compact horizontal */}
        <HeroFeaturedGame />

        {/* 3. Tournaments */}
        <section>
          <CompactUpcomingCard
            icon={Trophy}
            title={t('upcoming.tournaments.title', 'Tournaments')}
            description={t('upcoming.tournaments.description', 'Compete for crypto prizes')}
            chips={tournamentsChips}
            accentColor="amber"
            index={0}
            onClick={() => navigate('/tournaments/create')}
            showBadge={false}
          />
        </section>

        {/* 4. Popular Games Row */}
        <PopularGamesRow />

        {/* 5. All Games Grid - Compact */}
        <section className="space-y-3">
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-bold text-foreground flex items-center gap-2"
          >
            <Gamepad2 className="w-4 h-4 text-primary" />
            All Games
          </motion.h3>
          
          <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-2">
            {gridGames.map((game, index) => (
              <CompactGameCard
                key={game.id}
                game={game}
                index={index}
                onClick={() => handleGameClick(game)}
              />
            ))}
          </div>

          {/* Empty state */}
          {gridGames.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Gamepad2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No games in this category</p>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
