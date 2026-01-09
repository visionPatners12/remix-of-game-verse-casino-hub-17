import React from 'react';
import { format } from 'date-fns';
import { Trophy, Calendar, TrendingUp, Share2, Coins, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { UnifiedModal } from '@/components/unified/UnifiedModal';
import { ThirdWebNFT } from '../types';
import { getBestMediaUrl } from '../services/nftService';
import { cn } from '@/utils';

interface NFTDetailModalProps {
  nft: ThirdWebNFT | null;
  isOpen: boolean;
  onClose: () => void;
}

export const NFTDetailModal: React.FC<NFTDetailModalProps> = ({ nft, isOpen, onClose }) => {
  if (!nft) return null;

  const imageUrl = getBestMediaUrl(nft);
  const displayName = nft.name || 'Pryzen NFT';
  
  // Extract bet details
  const betDetails = nft.extra_metadata?.properties?.bet;
  const legs = nft.extra_metadata?.properties?.legs || [];
  const firstLeg = legs[0];
  
  const isWon = betDetails?.is_won;
  const stake = betDetails?.amount;
  const payout = betDetails?.potential_win;
  const currency = betDetails?.currency || 'USDT';
  const totalOdds = betDetails?.total_odds;
  const betType = betDetails?.bet_type;
  const settledAt = betDetails?.settled_at;

  const handleShare = async () => {
    const text = `🏆 I won ${payout} ${currency} on Pryzen! Check out my winning bet NFT.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: displayName, text, url: window.location.href });
      } catch {}
    } else {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  return (
    <UnifiedModal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      contentClassName="p-0 overflow-hidden max-h-[90vh]"
    >
      <div className="flex flex-col max-h-[90vh] overflow-y-auto">
        {/* NFT Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative aspect-square w-full max-h-[50vh] bg-muted"
        >
          <img
            src={imageUrl}
            alt={displayName}
            className="w-full h-full object-contain"
          />
          
          {/* WON Badge */}
          {isWon && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500 shadow-lg shadow-green-500/30"
            >
              <Trophy className="w-4 h-4 text-white" />
              <span className="text-sm font-bold text-white">WON</span>
            </motion.div>
          )}
        </motion.div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Title & Token ID */}
          <div>
            <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
            <p className="text-sm text-muted-foreground">Token #{nft.token_id}</p>
          </div>

          {/* Match Info (if available) */}
          {firstLeg && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-muted/50 rounded-xl p-4 space-y-3"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <Target className="w-4 h-4" />
                <span className="text-xs font-medium uppercase">{firstLeg.league_name}</span>
              </div>
              
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground">
                  {firstLeg.home_team_name} <span className="text-muted-foreground">vs</span> {firstLeg.away_team_name}
                </p>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{format(new Date(firstLeg.starts_at), 'MMM d, yyyy HH:mm')}</span>
                </div>
                <div className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium">
                  {firstLeg.market_type}
                </div>
              </div>

              <div className="pt-2 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pick</span>
                  <span className="font-semibold text-foreground">{firstLeg.pick}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Bet Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-3"
          >
            {/* Stake */}
            <div className="bg-muted/50 rounded-xl p-3 text-center">
              <Coins className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground mb-0.5">Stake</p>
              <p className="font-bold text-foreground">{stake} {currency}</p>
            </div>

            {/* Odds */}
            <div className="bg-muted/50 rounded-xl p-3 text-center">
              <TrendingUp className="w-4 h-4 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground mb-0.5">Odds</p>
              <p className="font-bold text-foreground">{totalOdds}x</p>
            </div>

            {/* Payout */}
            <div className={cn(
              "rounded-xl p-3 text-center",
              isWon ? "bg-green-500/10" : "bg-muted/50"
            )}>
              <Trophy className={cn("w-4 h-4 mx-auto mb-1", isWon ? "text-green-500" : "text-muted-foreground")} />
              <p className="text-xs text-muted-foreground mb-0.5">Payout</p>
              <p className={cn("font-bold", isWon ? "text-green-500" : "text-foreground")}>
                {payout} {currency}
              </p>
            </div>
          </motion.div>

          {/* Additional Info */}
          <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border/50 pt-4">
            <div className="flex items-center gap-2">
              <span className="capitalize">{betType} bet</span>
              {legs.length > 1 && <span>• {legs.length} legs</span>}
            </div>
            {settledAt && (
              <span>{format(new Date(settledAt), 'MMM d, yyyy')}</span>
            )}
          </div>

          {/* Share Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share on Twitter
          </motion.button>
        </div>
      </div>
    </UnifiedModal>
  );
};
