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

// Theme-aligned color palette using HSL variables
const PLAYER_COLORS: Record<string, { primary: string; glow: string }> = {
  R: { primary: 'hsl(0, 84%, 60%)', glow: 'hsl(0, 84%, 70%)' },
  G: { primary: 'hsl(142, 71%, 45%)', glow: 'hsl(142, 71%, 55%)' },
  Y: { primary: 'hsl(43, 100%, 52%)', glow: 'hsl(43, 100%, 62%)' },
  B: { primary: 'hsl(260, 100%, 65%)', glow: 'hsl(260, 100%, 75%)' },
};

// Floating particle component with theme colors
const NeonParticle: React.FC<{ delay: number; isWinner: boolean }> = ({ delay, isWinner }) => {
  const randomX = Math.random() * 100;
  const randomDuration = 3 + Math.random() * 2;
  const randomSize = 3 + Math.random() * 5;
  
  return (
    <motion.div
      className={cn(
        "absolute rounded-full pointer-events-none",
        isWinner ? "bg-primary" : "bg-muted-foreground/30"
      )}
      style={{
        width: randomSize,
        height: randomSize,
        left: `${randomX}%`,
        bottom: -10,
        boxShadow: isWinner 
          ? `0 0 ${randomSize * 2}px hsl(var(--primary))` 
          : 'none',
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

// Energy wave burst animation with theme color
const EnergyWave: React.FC = () => (
  <motion.div
    className="absolute inset-0 rounded-full pointer-events-none border-2 border-primary"
    style={{
      boxShadow: '0 0 20px hsl(var(--primary))',
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

  const playerColor = PLAYER_COLORS[winnerColor] || PLAYER_COLORS.B;

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
          "sm:max-w-[440px] p-0 overflow-hidden border border-border/50",
          "bg-card shadow-2xl"
        )}
        style={{
          boxShadow: isCurrentUserWinner 
            ? '0 0 60px hsl(var(--primary) / 0.2), 0 0 100px hsl(var(--primary) / 0.1)'
            : '0 0 40px hsl(var(--muted-foreground) / 0.1)',
        }}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Cosmic gradient overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background: isCurrentUserWinner 
              ? 'radial-gradient(ellipse at 50% 0%, hsl(var(--primary) / 0.3) 0%, transparent 60%)'
              : 'radial-gradient(ellipse at 50% 0%, hsl(var(--muted) / 0.5) 0%, transparent 60%)',
          }}
        />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <AnimatePresence>
            {showParticles && [...Array(25)].map((_, i) => (
              <NeonParticle 
                key={i} 
                delay={i * 0.2} 
                isWinner={isCurrentUserWinner}
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
          {/* Crown/Shield with animated effect */}
          <motion.div 
            variants={iconVariants}
            className="mb-6 relative"
          >
            {/* Energy wave burst */}
            {showEnergyWave && isCurrentUserWinner && <EnergyWave />}

            {/* Rotating halo */}
            <motion.div
              className="absolute -inset-4 rounded-full opacity-60"
              style={{
                background: isCurrentUserWinner 
                  ? 'conic-gradient(from 0deg, transparent, hsl(var(--primary) / 0.6), transparent, hsl(var(--accent) / 0.4), transparent)'
                  : 'conic-gradient(from 0deg, transparent, hsl(var(--muted) / 0.3), transparent)',
                filter: 'blur(6px)',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />

            {/* Inner glow ring */}
            <motion.div
              className={cn(
                "absolute -inset-2 rounded-full border",
                isCurrentUserWinner ? "border-primary/30" : "border-muted/30"
              )}
              style={{
                boxShadow: isCurrentUserWinner 
                  ? 'inset 0 0 20px hsl(var(--primary) / 0.2)'
                  : 'inset 0 0 20px hsl(var(--muted) / 0.1)',
              }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Icon container with levitation */}
            <motion.div
              className={cn(
                "relative p-5 rounded-full border",
                isCurrentUserWinner 
                  ? "bg-primary/20 border-primary/40" 
                  : "bg-muted/30 border-muted/40"
              )}
              style={{
                boxShadow: isCurrentUserWinner
                  ? '0 0 30px hsl(var(--primary) / 0.4), inset 0 0 20px hsl(var(--primary) / 0.2)'
                  : '0 0 20px hsl(var(--muted) / 0.2)',
              }}
              animate={isCurrentUserWinner ? { y: [-3, 3, -3] } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              {isCurrentUserWinner ? (
                <Crown 
                  className="w-10 h-10 text-primary" 
                  style={{ 
                    filter: 'drop-shadow(0 0 10px hsl(var(--primary) / 0.6))',
                  }} 
                  strokeWidth={1.5} 
                />
              ) : (
                <Shield className="w-10 h-10 text-muted-foreground" strokeWidth={1.5} />
              )}
            </motion.div>
          </motion.div>

          {/* Title with theme styling */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h2 
              className={cn(
                "text-2xl font-bold tracking-[0.15em] uppercase",
                isCurrentUserWinner ? "text-primary" : "text-muted-foreground"
              )}
              style={{
                textShadow: isCurrentUserWinner 
                  ? '0 0 10px hsl(var(--primary) / 0.5), 0 0 20px hsl(var(--primary) / 0.3)'
                  : 'none',
              }}
            >
              {isCurrentUserWinner ? "Victory" : "Game Over"}
            </h2>
            {!isCurrentUserWinner && (
              <p className="text-sm mt-2 tracking-wide text-muted-foreground/70">
                Better luck next time
              </p>
            )}
          </motion.div>

          {/* Winner avatar */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col items-center mb-8"
          >
            <div className="relative">
              {/* Rotating outer ring */}
              <motion.div
                className="absolute -inset-3 rounded-full opacity-50"
                style={{
                  background: `conic-gradient(from 0deg, transparent, ${playerColor.primary}, transparent)`,
                  filter: 'blur(4px)',
                }}
                animate={{ rotate: -360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              />

              {/* Avatar border glow */}
              <div 
                className="relative p-1 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${playerColor.primary}, ${playerColor.glow})`,
                  boxShadow: `0 0 20px ${playerColor.primary}`,
                }}
              >
                <Avatar 
                  className="w-20 h-20 border-2"
                  style={{ borderColor: playerColor.primary }}
                >
                  <AvatarImage src={winnerAvatar} className="object-cover" />
                  <AvatarFallback 
                    className="text-xl font-semibold bg-card"
                    style={{ color: playerColor.primary }}
                  >
                    {winnerName?.charAt(0)?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-lg font-semibold text-foreground">
                {winnerName}
              </p>
              <p 
                className={cn(
                  "text-xs uppercase tracking-[0.2em] mt-1 flex items-center justify-center gap-1 font-medium",
                  isCurrentUserWinner ? "text-primary" : "text-muted-foreground"
                )}
              >
                {isCurrentUserWinner && <Sparkles className="w-3 h-3" />}
                {isCurrentUserWinner ? "Champion" : "Winner"}
                {isCurrentUserWinner && <Sparkles className="w-3 h-3" />}
              </p>
            </div>
          </motion.div>

          {/* Prize amount section */}
          <motion.div 
            variants={itemVariants}
            className={cn(
              "w-full mb-8 px-5 py-4 rounded-xl relative overflow-hidden border",
              potAmount && potAmount > 0 
                ? "bg-success/5 border-success/30" 
                : "bg-muted/20 border-muted/30"
            )}
            style={{
              boxShadow: potAmount && potAmount > 0 
                ? '0 0 20px hsl(142 71% 45% / 0.1), inset 0 0 30px hsl(142 71% 45% / 0.05)'
                : '0 0 20px hsl(var(--muted) / 0.1)',
            }}
          >
            {/* Animated border glow */}
            {potAmount && potAmount > 0 && (
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent, hsl(142 71% 45% / 0.2), transparent)',
                  backgroundSize: '200% 100%',
                }}
                animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
            )}

            <div className="relative flex items-center justify-center">
              {potAmount && potAmount > 0 ? (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/15">
                    <Wallet className="w-4 h-4 text-success" strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-[0.15em] text-success/80 font-medium">
                      Prize Pool
                    </span>
                    <span 
                      className="text-xl font-bold tracking-wide text-success"
                      style={{ textShadow: '0 0 10px hsl(142 71% 45% / 0.4)' }}
                    >
                      {potAmount.toFixed(2)} USDC
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-lg uppercase tracking-[0.15em] text-muted-foreground font-medium">
                  Free Game
                </span>
              )}
            </div>

            {/* Claim section - only show for paid games */}
            {isCurrentUserWinner && potAmount && potAmount > 0 && (
              <div className="pt-3 mt-3 border-t border-success/20 relative">
                {canClaim && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={handleClaim}
                      className="w-full bg-success hover:bg-success/90 text-success-foreground font-semibold"
                      style={{
                        boxShadow: '0 0 20px hsl(142 71% 45% / 0.4)',
                      }}
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      Claim {potAmount.toFixed(2)} USDC
                    </Button>
                  </motion.div>
                )}

                {isClaimPending && (
                  <div className="flex items-center justify-center gap-2 py-2 text-accent">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Processing transaction...</span>
                  </div>
                )}

                {isClaimConfirmed && (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Prize Claimed</span>
                    </div>
                    {claimTxHash && (
                      <a
                        href={`https://basescan.org/tx/${claimTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-success/70 hover:text-success transition-colors"
                      >
                        View on Basescan
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}

                {isClaimFailed && (
                  <Button
                    onClick={handleRetryClaim}
                    variant="outline"
                    className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry Claim
                  </Button>
                )}
              </div>
            )}
          </motion.div>

          {/* Action buttons */}
          <motion.div 
            variants={itemVariants}
            className="w-full space-y-3"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                onClick={onPlayAgain}
                className="w-full h-12 font-semibold tracking-wider uppercase"
                style={{
                  boxShadow: '0 0 25px hsl(var(--primary) / 0.3)',
                }}
              >
                New Game
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" strokeWidth={2} />
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Button 
                onClick={onBackToGames}
                variant="outline"
                className="w-full h-11 tracking-wider uppercase text-muted-foreground hover:text-primary hover:border-primary/50"
              >
                Back to Games
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
