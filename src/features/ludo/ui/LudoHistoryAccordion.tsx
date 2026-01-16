import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Trophy, Clock, Minus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { PastGame } from '../hooks/useUserPastGames';

interface LudoHistoryAccordionProps {
  games: PastGame[];
  loading: boolean;
  userId?: string;
}

export const LudoHistoryAccordion: React.FC<LudoHistoryAccordionProps> = ({ 
  games, 
  loading,
  userId 
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  if (loading) {
    return (
      <div className="py-4">
        <div className="h-5 w-24 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (games.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full flex items-center justify-between py-3 group">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            My History
          </h2>
          <span className="text-xs text-muted-foreground/60">
            ({games.length})
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </motion.div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 pb-4"
            >
              {games.map((game, index) => (
                <HistoryCard 
                  key={game.id} 
                  game={game} 
                  index={index}
                  isWinner={game.winner_user_id === userId}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CollapsibleContent>
    </Collapsible>
  );
};

interface HistoryCardProps {
  game: PastGame;
  index: number;
  isWinner: boolean;
}

const HistoryCard: React.FC<HistoryCardProps> = ({ game, index, isWinner }) => {
  const timeAgo = game.finished_at 
    ? formatDistanceToNow(new Date(game.finished_at), { addSuffix: true })
    : 'Unknown';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-center gap-3 p-3 rounded-lg border ${
        isWinner 
          ? 'bg-success/5 border-success/20' 
          : 'bg-muted/30 border-border'
      }`}
    >
      {/* Result icon */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        isWinner 
          ? 'bg-success/20 text-success' 
          : 'bg-muted text-muted-foreground'
      }`}>
        {isWinner ? (
          <Trophy className="w-4 h-4" />
        ) : (
          <Minus className="w-4 h-4" />
        )}
      </div>

      {/* Game info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium text-foreground">
            #{game.room_code || 'N/A'}
          </span>
          {isWinner && (
            <span className="text-[10px] font-semibold text-success uppercase">
              Won
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{timeAgo}</span>
        </div>
      </div>

      {/* Prize/bet info */}
      {game.pot && game.pot > 0 ? (
        <span className={`text-sm font-semibold ${
          isWinner ? 'text-success' : 'text-muted-foreground'
        }`}>
          {isWinner ? '+' : ''}${game.pot}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">FREE</span>
      )}
    </motion.div>
  );
};
