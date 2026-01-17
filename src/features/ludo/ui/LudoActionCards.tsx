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
      {/* Main Actions Row */}
      <div className="flex gap-3">
        {/* Create Game Button - Compact */}
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileTap={{ scale: 0.96 }}
          transition={{ delay: 0.1 }}
          onClick={() => navigate('/games/ludo/create')}
          className="w-20 shrink-0 rounded-2xl bg-primary shadow-lg shadow-primary/25 flex flex-col items-center justify-center gap-2 py-4 group active:shadow-primary/40"
        >
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/25 transition-colors">
            <Plus className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="text-xs font-bold text-primary-foreground tracking-wide">
            NEW
          </span>
        </motion.button>

        {/* Join by Code - Takes remaining space */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="flex-1 rounded-2xl bg-card border border-border p-3 flex flex-col gap-2"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Join with code
            </span>
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="ABC123"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 6))}
              onKeyDown={(e) => e.key === 'Enter' && roomCode.length === 6 && handleJoin()}
              className="flex-1 h-11 font-mono text-center text-lg tracking-[0.3em] bg-background border-border uppercase placeholder:text-muted-foreground/40 placeholder:tracking-[0.3em]"
              maxLength={6}
              disabled={isJoining}
            />
            <Button
              onClick={handleJoin}
              disabled={roomCode.length !== 6 || isJoining}
              size="lg"
              className="h-11 px-5 font-bold"
            >
              {isJoining ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowRight className="w-5 h-5" />
              )}
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Play Online - Coming Soon */}
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        onClick={handleNotify}
        className="w-full rounded-xl bg-muted/50 border border-border hover:border-violet-500/30 transition-colors p-3 flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-violet-500/15 flex items-center justify-center">
            <Swords className="w-4 h-4 text-violet-400" />
          </div>
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">Play Online</span>
              <Badge 
                variant="secondary" 
                className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-[9px] px-1.5 py-0"
              >
                SOON
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Matchmaking & ranked games
            </span>
          </div>
        </div>
        <Bell className="w-4 h-4 text-muted-foreground group-hover:text-violet-400 transition-colors" />
      </motion.button>
    </div>
  );
};
