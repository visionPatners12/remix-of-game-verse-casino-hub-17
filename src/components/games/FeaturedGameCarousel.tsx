import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Flame, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useActivePlayers } from '@/hooks/useActivePlayers';

interface FeaturedGame {
  id: string;
  name: string;
  description: string;
  image: string;
  isHot: boolean;
  route: string;
}

const FEATURED_GAMES: FeaturedGame[] = [
  {
    id: 'ludo',
    name: 'Ludo',
    description: 'The classic board game, now on-chain. Bet & win crypto!',
    image: 'https://images.unsplash.com/photo-1611891487122-207579d67d98?w=800&h=400&fit=crop',
    isHot: true,
    route: '/games/ludo',
  },
];

export const FeaturedGameCarousel: React.FC = () => {
  const navigate = useNavigate();
  const { data: playersData } = useActivePlayers();

  return (
    <div className="relative">
      {FEATURED_GAMES.map((game, index) => (
        <motion.div
          key={game.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={cn(
            "relative overflow-hidden rounded-2xl",
            "bg-gradient-to-br from-primary/20 via-background to-accent/10",
            "border border-primary/30"
          )}
        >
          {/* Background Image with overlay */}
          <div className="absolute inset-0">
            <img
              src={game.image}
              alt={game.name}
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative p-6 flex flex-col gap-4">
            {/* Badges */}
            <div className="flex items-center gap-2">
              {game.isHot && (
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 animate-pulse gap-1">
                  <Flame className="w-3 h-3" />
                  HOT
                </Badge>
              )}
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                LIVE
              </Badge>
            </div>

            {/* Title & Description */}
            <div>
              <h2 className="text-2xl font-bold mb-1">{game.name}</h2>
              <p className="text-sm text-muted-foreground max-w-xs">
                {game.description}
              </p>
            </div>

            {/* Stats & CTA */}
            <div className="flex items-center justify-between gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-sm text-primary">
                <Users className="w-4 h-4" />
                <span className="font-semibold">{playersData?.ludoPlayers ?? 0}</span>
                <span className="text-muted-foreground">playing</span>
              </div>

              <Button
                onClick={() => navigate(game.route)}
                className="gap-2 shadow-lg shadow-primary/25"
              >
                <Play className="w-4 h-4" />
                Play Now
              </Button>
            </div>
          </div>

          {/* Animated glow effect */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent/20 rounded-full blur-2xl animate-pulse delay-1000" />
        </motion.div>
      ))}
    </div>
  );
};
