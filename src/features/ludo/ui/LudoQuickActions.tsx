import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Hash, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useJoinGameByCode } from '../hooks/useJoinGameByCode';

export const LudoQuickActions: React.FC = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const { joinGame, isJoining } = useJoinGameByCode();

  const handleJoin = async () => {
    if (roomCode.trim().length === 6) {
      await joinGame(roomCode.trim());
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Create Game Card */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onClick={() => navigate('/games/ludo/create')}
        className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-4 text-left transition-all duration-300 active:scale-[0.98]"
      >
        {/* Glow on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-3">
          <Plus className="w-6 h-6 text-primary-foreground" />
        </div>
        
        {/* Text */}
        <h3 className="font-bold text-primary-foreground text-base mb-0.5">Create Game</h3>
        <p className="text-xs text-primary-foreground/70">Start a new match</p>
        
        {/* Arrow */}
        <ArrowRight className="absolute bottom-4 right-4 w-5 h-5 text-primary-foreground/50 group-hover:translate-x-1 transition-transform" />
      </motion.button>

      {/* Join with Code Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden rounded-2xl bg-muted/50 border border-border p-4"
      >
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-3">
          <Hash className="w-6 h-6 text-foreground" />
        </div>
        
        {/* Text */}
        <h3 className="font-bold text-foreground text-sm mb-2">Join by Code</h3>
        
        {/* Input + Button */}
        <div className="flex gap-1.5">
          <Input
            placeholder="ABC123"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 6))}
            onKeyDown={(e) => e.key === 'Enter' && roomCode.length === 6 && handleJoin()}
            className="h-9 font-mono tracking-widest text-center text-xs bg-background border-border"
            maxLength={6}
            disabled={isJoining}
          />
          <Button
            onClick={handleJoin}
            disabled={roomCode.length !== 6 || isJoining}
            size="sm"
            className="h-9 px-3 shrink-0"
          >
            {isJoining ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
