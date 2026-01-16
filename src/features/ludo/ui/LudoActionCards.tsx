import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, ArrowRight, Swords, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useJoinGameByCode } from '../hooks/useJoinGameByCode';
import { toast } from 'sonner';

export const LudoActionCards: React.FC = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const { joinGame, isJoining } = useJoinGameByCode();

  const handleJoin = async () => {
    if (roomCode.trim().length === 6) {
      await joinGame(roomCode.trim());
    }
  };

  const handleNotify = () => {
    toast.success('We\'ll notify you when Play Online is available!', {
      icon: '🔔',
    });
  };

  return (
    <div className="space-y-3">
      {/* Row 1: Create + Join (50/50) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Create Game - Left */}
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileTap={{ scale: 0.98 }}
          transition={{ delay: 0.1 }}
          onClick={() => navigate('/games/ludo/create')}
          className="relative h-32 rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 shadow-lg shadow-primary/20 overflow-hidden group"
        >
          {/* Animated glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/0 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }} />

          {/* Content */}
          <div className="relative h-full flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Plus className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold text-primary-foreground tracking-wide">
              CREATE GAME
            </span>
          </div>

          {/* Corner accent */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-bl-[40px]" />
        </motion.button>

        {/* Join by Code - Right (50%) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="h-32 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors p-4 flex flex-col"
        >
          <span className="text-sm font-semibold text-foreground mb-2">
            Join Room
          </span>
          
          <Input
            placeholder="ENTER CODE"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 6))}
            onKeyDown={(e) => e.key === 'Enter' && roomCode.length === 6 && handleJoin()}
            className="h-10 font-mono text-center text-base tracking-[0.25em] bg-background border-border mb-2 uppercase"
            maxLength={6}
            disabled={isJoining}
          />
          
          <Button
            onClick={handleJoin}
            disabled={roomCode.length !== 6 || isJoining}
            className="w-full h-9 font-semibold"
          >
            {isJoining ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                JOIN
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </>
            )}
          </Button>
        </motion.div>
      </div>

      {/* Row 2: Play Online - Coming Soon */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-fuchsia-500/10 border border-violet-500/20 p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Swords className="w-5 h-5 text-violet-400" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">Play Online</span>
                <Badge 
                  variant="secondary" 
                  className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-[10px] px-1.5 py-0 animate-pulse"
                >
                  SOON
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                Ranked • Matchmaking • Stakes
              </span>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleNotify}
            className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10 hover:text-violet-200"
          >
            <Bell className="w-3.5 h-3.5 mr-1.5" />
            Notify
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
