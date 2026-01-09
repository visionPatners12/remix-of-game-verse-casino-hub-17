import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Crown, Shield, Wallet, ArrowRight, Loader2, ExternalLink, RefreshCw, CheckCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useGameSounds } from '@/hooks/useGameSounds';
import { useClaimPrize } from '../hooks/useClaimPrize';
import { cn } from '@/lib/utils';

type ClaimStatus = 'received' | 'pending_confirmations' | 'confirmed' | 'mismatch' | 'reverted' | 'timeout' | null;

interface WinnerModalProps {
  isOpen: boolean;
  winnerColor: string;
  winnerName: string;
  winnerAvatar?: string;
  isCurrentUserWinner: boolean;
  potAmount?: number;
  gameId: string;
  claimStatus?: ClaimStatus;
  claimTxHash?: string | null;
  onPlayAgain: () => void;
  onBackToGames: () => void;
}

// Neon color palette matching the futuristic board
const NEON_COLORS: Record<string, { primary: string; glow: string; rgb: string }> = {
  R: { primary: '#ff1a4d', glow: '#ff6b8a', rgb: '255, 26, 77' },
  G: { primary: '#00ff88', glow: '#4dffb3', rgb: '0, 255, 136' },
  Y: { primary: '#ffea00', glow: '#fff566', rgb: '255, 234, 0' },
  B: { primary: '#00d4ff', glow: '#66e0ff', rgb: '0, 212, 255' },
};

// Neon floating particle component
const NeonParticle: React.FC<{ delay: number; color: string }> = ({ delay, color }) => {
  const randomX = Math.random() * 100;
  const randomDuration = 3 + Math.random() * 2;
  const randomSize = 3 + Math.random() * 5;
  
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: randomSize,
        height: randomSize,
        left: `${randomX}%`,
        bottom: -10,
        background: color,
        boxShadow: `0 0 ${randomSize * 2}px ${color}`,
      }}
      initial={{ y: 0, opacity: 0 }}
      animate={{
        y: -350,
        opacity: [0, 1, 1, 0],
        x: [0, Math.random() * 30 - 15, Math.random() * 50 - 25],
      }}
      transition={{
        duration: randomDuration,
        delay: delay,
        repeat: Infinity,
        ease: "easeOut",
      }}
    />
  );
};

// Energy wave burst animation
const EnergyWave: React.FC<{ color: string }> = ({ color }) => (
  <motion.div
    className="absolute inset-0 rounded-full pointer-events-none"
    style={{
      border: `2px solid ${color}`,
      boxShadow: `0 0 20px ${color}`,
    }}
    initial={{ scale: 0.8, opacity: 1 }}
    animate={{ scale: 2.5, opacity: 0 }}
    transition={{ duration: 1.5, ease: "easeOut" }}
  />
);

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const iconVariants = {
  hidden: { opacity: 0, scale: 0, rotate: -180 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: "spring" as const, stiffness: 200, damping: 15 },
  },
};

export const WinnerModal: React.FC<WinnerModalProps> = ({
  isOpen,
  winnerColor,
  winnerName,
  winnerAvatar,
  isCurrentUserWinner,
  potAmount,
  gameId,
  claimStatus,
  claimTxHash,
  onPlayAgain,
  onBackToGames,
}) => {
  const [showParticles, setShowParticles] = useState(false);
  const [showEnergyWave, setShowEnergyWave] = useState(false);
  const { playVictorySound, playGameOverSound } = useGameSounds();
  const { claimPrize, isPending } = useClaimPrize();

  const neonColor = NEON_COLORS[winnerColor] || NEON_COLORS.G;

  const handleClaim = () => {
    if (gameId) {
      claimPrize(gameId, false);
    }
  };

  const handleRetryClaim = () => {
    if (gameId) {
      claimPrize(gameId, true);
    }
  };

  const isClaimPending = isPending || claimStatus === 'received' || claimStatus === 'pending_confirmations';
  const isClaimConfirmed = claimStatus === 'confirmed';
  const isClaimFailed = claimStatus === 'mismatch' || claimStatus === 'reverted' || claimStatus === 'timeout';
  const canClaim = isCurrentUserWinner && potAmount && potAmount > 0 && !claimStatus && !isPending;

  useEffect(() => {
    if (isOpen) {
      setShowParticles(true);
      setShowEnergyWave(true);
      setTimeout(() => setShowEnergyWave(false), 1500);
      
      if (isCurrentUserWinner) {
        playVictorySound();
      } else {
        playGameOverSound();
      }
    } else {
      setShowParticles(false);
    }
  }, [isOpen, isCurrentUserWinner, playVictorySound, playGameOverSound]);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className={cn(
          "sm:max-w-[440px] p-0 overflow-hidden border-0",
          "shadow-2xl"
        )}
        style={{
          background: 'linear-gradient(135deg, #0a0a1a 0%, #0f0f2a 50%, #0a0a1a 100%)',
          boxShadow: `0 0 60px rgba(${neonColor.rgb}, 0.3), 0 0 100px rgba(${neonColor.rgb}, 0.1)`,
        }}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Scanlines overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
          }}
        />

        {/* Cosmic gradient overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, rgba(${neonColor.rgb}, 0.4) 0%, transparent 60%)`,
          }}
        />

        {/* Grid lines */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(${neonColor.primary}20 1px, transparent 1px),
              linear-gradient(90deg, ${neonColor.primary}20 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px',
          }}
        />

        {/* Floating neon particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <AnimatePresence>
            {showParticles && [...Array(25)].map((_, i) => (
              <NeonParticle 
                key={i} 
                delay={i * 0.2} 
                color={isCurrentUserWinner ? neonColor.glow : '#666'}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Content container */}
        <motion.div
          className="relative z-10 flex flex-col items-center px-8 py-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Crown/Shield with holographic effect */}
          <motion.div 
            variants={iconVariants}
            className="mb-6 relative"
          >
            {/* Energy wave burst */}
            {showEnergyWave && isCurrentUserWinner && (
              <EnergyWave color={neonColor.primary} />
            )}

            {/* Rotating halo */}
            <motion.div
              className="absolute -inset-4 rounded-full"
              style={{
                background: `conic-gradient(from 0deg, transparent, ${neonColor.primary}80, transparent, ${neonColor.glow}60, transparent)`,
                filter: 'blur(6px)',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />

            {/* Inner glow ring */}
            <motion.div
              className="absolute -inset-2 rounded-full"
              style={{
                border: `1px solid ${neonColor.primary}40`,
                boxShadow: `inset 0 0 20px ${neonColor.primary}20`,
              }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Icon container with levitation */}
            <motion.div
              className="relative p-5 rounded-full"
              style={{
                background: isCurrentUserWinner 
                  ? `linear-gradient(135deg, ${neonColor.primary}40, ${neonColor.glow}20)`
                  : 'linear-gradient(135deg, #333, #222)',
                boxShadow: isCurrentUserWinner
                  ? `0 0 30px ${neonColor.primary}60, inset 0 0 20px ${neonColor.glow}30`
                  : '0 0 20px rgba(100,100,100,0.3)',
                border: `1px solid ${isCurrentUserWinner ? neonColor.primary : '#444'}`,
              }}
              animate={isCurrentUserWinner ? { y: [-3, 3, -3] } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              {isCurrentUserWinner ? (
                <Crown 
                  className="w-10 h-10" 
                  style={{ 
                    color: neonColor.primary,
                    filter: `drop-shadow(0 0 10px ${neonColor.glow})`,
                  }} 
                  strokeWidth={1.5} 
                />
              ) : (
                <Shield className="w-10 h-10 text-slate-400" strokeWidth={1.5} />
              )}
            </motion.div>
          </motion.div>

          {/* Title with Orbitron font and neon glow */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h2 
              className="text-2xl tracking-[0.3em] uppercase"
              style={{
                fontFamily: 'Orbitron, sans-serif',
                color: isCurrentUserWinner ? neonColor.primary : '#888',
                textShadow: isCurrentUserWinner 
                  ? `0 0 10px ${neonColor.glow}, 0 0 20px ${neonColor.primary}60, 0 0 40px ${neonColor.primary}30`
                  : 'none',
              }}
            >
              {isCurrentUserWinner ? "Victory" : "Game Over"}
            </h2>
            {!isCurrentUserWinner && (
              <p 
                className="text-sm mt-2 tracking-wider"
                style={{ 
                  fontFamily: 'Orbitron, sans-serif',
                  color: '#666',
                }}
              >
                Better luck next time
              </p>
            )}
          </motion.div>

          {/* Winner avatar with holographic effect */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col items-center mb-8"
          >
            <div className="relative">
              {/* Rotating outer ring */}
              <motion.div
                className="absolute -inset-3 rounded-full"
                style={{
                  background: `conic-gradient(from 0deg, ${neonColor.primary}00, ${neonColor.primary}60, ${neonColor.primary}00)`,
                  filter: 'blur(4px)',
                }}
                animate={{ rotate: -360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              />

              {/* Avatar border glow */}
              <div 
                className="relative p-1 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${neonColor.primary}60, ${neonColor.glow}40)`,
                  boxShadow: `0 0 20px ${neonColor.primary}50`,
                }}
              >
                <Avatar className="w-20 h-20 border-2" style={{ borderColor: neonColor.primary }}>
                  <AvatarImage src={winnerAvatar} className="object-cover" />
                  <AvatarFallback 
                    className="text-xl font-medium"
                    style={{ 
                      background: '#1a1a2e',
                      color: neonColor.primary,
                    }}
                  >
                    {winnerName?.charAt(0)?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p 
                className="text-lg font-medium tracking-wide"
                style={{ 
                  color: '#fff',
                  textShadow: `0 0 10px ${neonColor.primary}40`,
                }}
              >
                {winnerName}
              </p>
              <p 
                className="text-xs uppercase tracking-[0.25em] mt-1 flex items-center justify-center gap-1"
                style={{ 
                  fontFamily: "'Orbitron', sans-serif",
                  color: isCurrentUserWinner ? neonColor.primary : '#666',
                }}
              >
                {isCurrentUserWinner && <Sparkles className="w-3 h-3" />}
                {isCurrentUserWinner ? "Champion" : "Winner"}
                {isCurrentUserWinner && <Sparkles className="w-3 h-3" />}
              </p>
            </div>
          </motion.div>

          {/* Prize amount with neon border */}
          <motion.div 
            variants={itemVariants}
            className="w-full mb-8 px-5 py-4 rounded-xl relative overflow-hidden"
            style={{
              background: potAmount && potAmount > 0 
                ? 'rgba(0, 255, 136, 0.05)' 
                : 'rgba(100, 100, 150, 0.1)',
              border: potAmount && potAmount > 0 
                ? '1px solid rgba(0, 255, 136, 0.3)' 
                : '1px solid rgba(100, 100, 150, 0.3)',
              boxShadow: potAmount && potAmount > 0 
                ? '0 0 20px rgba(0, 255, 136, 0.1), inset 0 0 30px rgba(0, 255, 136, 0.05)'
                : '0 0 20px rgba(100, 100, 150, 0.1)',
            }}
          >
            {/* Animated border glow */}
            {potAmount && potAmount > 0 && (
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.2), transparent)',
                  backgroundSize: '200% 100%',
                }}
                animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
            )}

            <div className="relative flex items-center justify-center">
              {potAmount && potAmount > 0 ? (
                <>
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2 rounded-lg"
                      style={{
                        background: 'rgba(0, 255, 136, 0.15)',
                        boxShadow: '0 0 10px rgba(0, 255, 136, 0.3)',
                      }}
                    >
                      <Wallet className="w-4 h-4" style={{ color: '#00ff88' }} strokeWidth={1.5} />
                    </div>
                    <div className="flex flex-col">
                      <span 
                        className="text-xs uppercase tracking-[0.15em]"
                        style={{ 
                          fontFamily: 'Orbitron, sans-serif',
                          color: 'rgba(0, 255, 136, 0.8)',
                        }}
                      >
                        Prize Pool
                      </span>
                      <span 
                        className="text-xl font-semibold tracking-wide"
                        style={{ 
                          fontFamily: 'Orbitron, sans-serif',
                          color: '#00ff88',
                          textShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
                        }}
                      >
                        {potAmount.toFixed(2)} USDT
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <span 
                  className="text-lg uppercase tracking-[0.2em]"
                  style={{ 
                    fontFamily: 'Orbitron, sans-serif',
                    color: 'rgba(150, 150, 180, 0.9)',
                    textShadow: '0 0 10px rgba(100, 100, 150, 0.3)',
                  }}
                >
                  Free Game
                </span>
              )}
            </div>

            {/* Claim section - only show for paid games */}
            {isCurrentUserWinner && potAmount && potAmount > 0 && (
              <div className="pt-3 mt-3 border-t border-emerald-500/20 relative">
                {canClaim && (
                  <motion.button
                    onClick={handleClaim}
                    className="w-full py-3 rounded-lg font-medium tracking-wide relative overflow-hidden group"
                    style={{
                      background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
                      color: '#000',
                      boxShadow: '0 0 20px rgba(0, 255, 136, 0.4)',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Wallet className="w-4 h-4" />
                      Claim {potAmount.toFixed(2)} USDT
                    </span>
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'linear-gradient(135deg, #4dffb3, #00ff88)' }}
                    />
                  </motion.button>
                )}

                {isClaimPending && (
                  <div className="flex items-center justify-center gap-2 py-2" style={{ color: '#ffea00' }}>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Processing transaction...</span>
                  </div>
                )}

                {isClaimConfirmed && (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2" style={{ color: '#00ff88' }}>
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Prize Claimed</span>
                    </div>
                    {claimTxHash && (
                      <a
                        href={`https://polygonscan.com/tx/${claimTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs transition-colors"
                        style={{ color: 'rgba(0, 255, 136, 0.7)' }}
                      >
                        View on Polygonscan
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}

                {isClaimFailed && (
                  <Button
                    onClick={handleRetryClaim}
                    variant="outline"
                    className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry Claim
                  </Button>
                )}
              </div>
            )}
          </motion.div>

          {/* Action buttons with neon styling */}
          <motion.div 
            variants={itemVariants}
            className="w-full space-y-3"
          >
            <motion.button 
              onClick={onPlayAgain}
              className="w-full h-12 text-sm font-medium tracking-wider uppercase rounded-lg relative overflow-hidden group"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                background: `linear-gradient(135deg, ${neonColor.primary}, ${neonColor.glow}80)`,
                color: '#000',
                boxShadow: `0 0 25px ${neonColor.primary}50, 0 0 50px ${neonColor.primary}20`,
                border: `1px solid ${neonColor.glow}60`,
              }}
              whileHover={{ scale: 1.02, boxShadow: `0 0 35px ${neonColor.primary}70, 0 0 70px ${neonColor.primary}30` }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                New Game
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={2} />
              </span>
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-30"
                style={{
                  background: `linear-gradient(90deg, transparent, ${neonColor.glow}, transparent)`,
                  backgroundSize: '200% 100%',
                }}
                animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            </motion.button>
            
            <motion.button 
              onClick={onBackToGames}
              className="w-full py-3 text-sm tracking-wider uppercase transition-all duration-300"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                color: '#666',
                background: 'transparent',
                border: '1px solid #333',
                borderRadius: '8px',
              }}
              whileHover={{ 
                color: neonColor.primary,
                borderColor: neonColor.primary,
                boxShadow: `0 0 15px ${neonColor.primary}30`,
              }}
            >
              Back to Games
            </motion.button>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
