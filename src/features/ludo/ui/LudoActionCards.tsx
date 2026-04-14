import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, ArrowRight, Swords, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useJoinGameByCode } from '../hooks/useJoinGameByCode';
import { useLudoMatchmaking } from '../hooks/useLudoMatchmaking';
import { toast } from 'sonner';

const BUCKET_HINT: Record<string, string> = {
  hot: 'Pool: players who won their recent games (same streak)',
  cold: 'Pool: players who lost their recent games (same streak)',
  mixed: 'Pool: mixed wins & losses recently',
};

export const LudoActionCards: React.FC = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const { joinGame, isJoining } = useJoinGameByCode();
  const { searching, bucketLabel, queueSize, start, stop } = useLudoMatchmaking();

  const handleJoin = async () => {
    if (roomCode.trim().length === 6) {
      await joinGame(roomCode.trim());
    }
  };

  const handlePlayOnline = async () => {
    const res = await start();
    if (res?.error === 'ACTIVE_GAME') {
      toast.error('Finish or leave your current Ludo game before matchmaking.');
      navigate('/games/ludo');
      return;
    }
    if (res?.error === 'NO_USER') {
      toast.error('Sign in to use matchmaking.');
      return;
    }
    if (res?.error) {
      toast.error('Could not join matchmaking.', { description: res.error });
    }
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

      {/* Play Online — free games, streak-based bucket matchmaking */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="w-full rounded-xl bg-muted/50 border border-border hover:border-violet-500/30 transition-colors p-3 flex flex-col gap-2"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0">
              <Swords className="w-4 h-4 text-violet-400" />
            </div>
            <div className="flex flex-col items-start min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-foreground">Play Online</span>
                <Badge
                  variant="secondary"
                  className="bg-emerald-500/15 text-emerald-300 border-emerald-500/25 text-[9px] px-1.5 py-0"
                >
                  FREE
                </Badge>
              </div>
              <span className="text-[11px] text-muted-foreground">
                {searching
                  ? `${BUCKET_HINT[bucketLabel ?? ''] ?? 'Finding players…'} · ${queueSize ?? '…'} in pool`
                  : 'Match with players on the same kind of streak: all wins, all losses, or mixed (last 5 finished games).'}
              </span>
            </div>
          </div>
          {searching ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 h-8"
              onClick={() => void stop()}
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Cancel
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              className="shrink-0 h-8 bg-violet-600 hover:bg-violet-500"
              onClick={handlePlayOnline}
            >
              Find match
            </Button>
          )}
        </div>
        {searching && (
          <div className="flex items-center gap-2 text-[11px] text-violet-300/90 pl-12">
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            Waiting for 3 other players in your pool…
          </div>
        )}
      </motion.div>
    </div>
  );
};
