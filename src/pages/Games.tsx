import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Badge } from '@/components/ui/badge';
import { Gamepad2, Flame, Users, Sparkles, Dices, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { FeaturedGameCarousel } from '@/components/games/FeaturedGameCarousel';
import { HotBadge } from '@/components/games/HotBadge';
import { LivePlayersCount } from '@/components/games/LivePlayersCount';

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

// Mock games data with live players
const MOCK_GAMES: MockGame[] = [
  // Real Ludo - featured
  { id: 'ludo', name: 'Ludo', category: ['popular', 'multiplayer'], image: 'https://images.unsplash.com/photo-1611891487122-207579d67d98?w=400&h=400&fit=crop', gradient: 'from-emerald-500 to-cyan-500', isMock: false, isHot: true, playersOnline: 127 },
  
  // Mock games - Popular
  { id: 'crash', name: 'Crash', category: ['popular', 'instant'], emoji: '📈', gradient: 'from-orange-500 to-red-600', isMock: true, playersOnline: 89 },
  { id: 'dice', name: 'Dice', category: ['popular', 'instant'], emoji: '🎯', gradient: 'from-violet-500 to-purple-600', isMock: true, playersOnline: 45 },
  { id: 'plinko', name: 'Plinko', category: ['instant', 'popular'], emoji: '🔮', gradient: 'from-pink-500 to-rose-600', isMock: true, playersOnline: 34 },
  
  // Slots
  { id: 'diamond-rush', name: 'Diamond Rush', category: ['slots'], emoji: '💎', gradient: 'from-cyan-400 to-blue-600', isMock: true },
  { id: 'fortune-wheel', name: 'Fortune', category: ['slots', 'popular'], emoji: '🎡', gradient: 'from-amber-400 to-orange-500', isMock: true },
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
  
  // Multiplayer - Coming soon
  { id: 'chess', name: 'Chess', category: ['multiplayer'], emoji: '♟️', gradient: 'from-neutral-700 to-neutral-900', isMock: true },
  { id: 'domino', name: 'Domino', category: ['multiplayer'], emoji: '🁣', gradient: 'from-stone-500 to-stone-700', isMock: true },
];

// Categories
const CATEGORIES = [
  { id: 'all', label: 'All', icon: Gamepad2 },
  { id: 'popular', label: 'Popular', icon: Flame },
  { id: 'multiplayer', label: 'Multiplayer', icon: Users },
  { id: 'slots', label: 'Slots', icon: Sparkles },
  { id: 'table', label: 'Table', icon: Dices },
  { id: 'instant', label: 'Instant', icon: Zap },
];

// Enhanced Game Card Component
const CasinoGameCard = ({ 
  game, 
  onClick,
  index
}: { 
  game: MockGame; 
  onClick: () => void;
  index: number;
}) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.03, duration: 0.2 }}
    whileHover={{ scale: 1.05, y: -4 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={cn(
      "relative aspect-square rounded-2xl overflow-hidden cursor-pointer",
      "group transition-shadow duration-300",
      "hover:shadow-2xl hover:shadow-primary/30",
      "bg-gradient-to-br", game.gradient,
      "border border-white/10",
      "shine-sweep"
    )}
  >
    {/* HOT Badge */}
    {game.isHot && !game.isMock && <HotBadge />}
    
    {/* Image for Ludo, emoji for others */}
    {game.image ? (
      <img 
        src={game.image} 
        alt={game.name} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
    ) : (
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span 
          className="text-5xl md:text-4xl drop-shadow-lg"
          whileHover={{ scale: 1.2, rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.3 }}
        >
          {game.emoji}
        </motion.span>
      </div>
    )}
    
    {/* Permanent dark overlay for mock games */}
    {game.isMock && (
      <div className="absolute inset-0 bg-black/50" />
    )}
    
    {/* SOON badge permanently visible for mock games */}
    {game.isMock && (
      <Badge className="absolute top-2 right-2 text-[10px] px-2 py-0.5 font-bold bg-black/80 text-white border-0">
        SOON
      </Badge>
    )}
    
    {/* Shine effect on hover */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
    
    {/* Game name at bottom with live players */}
    <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
      <p className="text-white font-bold text-sm text-center truncate drop-shadow-lg">
        {game.name}
      </p>
      {game.playersOnline && !game.isMock && (
        <div className="flex justify-center mt-0.5">
          <LivePlayersCount count={game.playersOnline} className="text-white/80" />
        </div>
      )}
    </div>
  </motion.div>
);

export default function Games() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');

  // Filter games by category
  const filteredGames = activeCategory === 'all' 
    ? MOCK_GAMES 
    : MOCK_GAMES.filter(game => game.category.includes(activeCategory as GameCategory));

  const handleGameClick = (game: MockGame) => {
    if (game.isMock) {
      toast.info(`${game.name} coming soon!`, {
        description: "This game will be available soon.",
      });
    } else {
      navigate(`/games/${game.id}`);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-3 py-4 max-w-6xl space-y-5">
        {/* Featured Carousel */}
        <FeaturedGameCarousel />

        {/* Categories Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar -mx-3 px-3">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap",
                  "transition-all duration-200 font-medium text-sm",
                  "border",
                  isActive 
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25" 
                    : "bg-muted/30 hover:bg-muted/60 text-muted-foreground border-border/50 hover:border-border"
                )}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </motion.button>
            );
          })}
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredGames.map((game, index) => (
            <CasinoGameCard
              key={game.id}
              game={game}
              index={index}
              onClick={() => handleGameClick(game)}
            />
          ))}
        </div>

        {/* Empty state */}
        {filteredGames.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Gamepad2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No games in this category</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
