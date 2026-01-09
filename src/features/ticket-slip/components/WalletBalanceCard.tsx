import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useWalletTokensThirdWeb } from '@/features/wallet/hooks/tokens/useWalletTokensThirdWeb';
import { TokenUSDT, TokenMATIC } from '@web3icons/react';

const POLYGON_CHAIN_ID = 137;

export function WalletBalanceCard() {
  const navigate = useNavigate();
  const { tokensByChain, isLoading, error } = useWalletTokensThirdWeb();
  
  // Get USDT on Polygon specifically
  const polygonTokens = tokensByChain[POLYGON_CHAIN_ID]?.tokens || [];
  const usdtToken = polygonTokens.find(t => 
    t.symbol.toUpperCase() === 'USDT'
  );
  
  const balance = usdtToken?.balance ? parseFloat(usdtToken.balance) : 0;
  const formattedBalance = balance.toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-4 border border-primary/20 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Token Icon */}
          <div className="relative">
            <div className="p-2 bg-[#009393]/20 rounded-xl">
              <TokenUSDT variant="branded" size={24} />
            </div>
            {/* Chain badge */}
            <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 border border-border">
              <TokenMATIC variant="branded" size={14} />
            </div>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground font-medium">
              Available Balance
            </p>
            {isLoading ? (
              <div className="flex items-center gap-2 mt-0.5">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">...</span>
              </div>
            ) : error ? (
              <p className="text-lg font-bold text-destructive">Error</p>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-foreground">
                  {formattedBalance} <span className="text-sm font-medium text-muted-foreground">USDT</span>
                </p>
                <div className="flex items-center gap-1 bg-purple-500/10 px-2 py-0.5 rounded-full">
                  <TokenMATIC variant="branded" size={12} />
                  <span className="text-xs text-purple-400">Polygon</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/wallet')}
          className="h-9 px-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm font-medium">
            Deposit
          </span>
        </Button>
      </div>
    </motion.div>
  );
}
