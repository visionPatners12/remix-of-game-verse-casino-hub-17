import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useJoinGameByCode } from '../hooks/useJoinGameByCode';

export const LudoActionCards: React.FC = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const { joinGame, isJoining } = useJoinGameByCode();

  const handleJoin = async () => {
    if (roomCode.trim().length === 6) {
      await joinGame(roomCode.trim());
    }
  };

  return (
    <div className="grid grid-cols-5 gap-3">
      {/* Create Game - Large Hero Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileTap={{ scale: 0.98 }}
        transition={{ delay: 0.1 }}
        onClick={() => navigate('/games/ludo/create')}
        className="col-span-3 relative h-28 rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 shadow-lg shadow-primary/20 overflow-hidden group"
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

      {/* Join by Code - Compact Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="col-span-2 h-28 rounded-2xl bg-card border-2 border-dashed border-border hover:border-primary/30 transition-colors p-3 flex flex-col"
      >
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          Join Room
        </span>
        
        <Input
          placeholder="CODE"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 6))}
          onKeyDown={(e) => e.key === 'Enter' && roomCode.length === 6 && handleJoin()}
          className="h-9 font-mono text-center text-sm tracking-[0.2em] bg-background border-border mb-2"
          maxLength={6}
          disabled={isJoining}
        />
        
        <Button
          onClick={handleJoin}
          disabled={roomCode.length !== 6 || isJoining}
          size="sm"
          className="w-full h-8 text-xs font-semibold"
        >
          {isJoining ? (
            <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              JOIN
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
};
