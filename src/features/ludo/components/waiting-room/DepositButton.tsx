import React, { useState, useEffect } from 'react';
import { CheckCircle, Loader2, Wallet, ExternalLink, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSendTransaction, useWallets } from '@privy-io/react-auth';
import { encodeFunctionData, parseUnits, erc20Abi } from 'viem';
import { polygon } from 'viem/chains';
import { useWaitForTransactionReceipt } from 'wagmi';
import { cn } from '@/lib/utils';
import { useWalletDeepLink } from '@/hooks/useWalletDeepLink';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

const USDT_CONTRACT = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' as const;
const DEPOSIT_ADDRESS = '0x47C294f6fb030367c5214c96b63fe6A7564AD773' as const;

type TransactionState = 'idle' | 'wallet-pending' | 'tx-pending' | 'confirming' | 'confirmed' | 'cancelled' | 'error';

interface DepositButtonProps {
  betAmount: number;
  hasDeposited: boolean;
  onDepositSuccess?: (txHash: string) => void;
  gameId: string;
  userId?: string;
}

export const DepositButton: React.FC<DepositButtonProps> = ({
  betAmount,
  hasDeposited,
  onDepositSuccess,
  gameId,
  userId,
}) => {
  const STORAGE_KEY = `ludo_deposit_${gameId}_${userId}`;
  
  const [transactionState, setTransactionState] = useState<TransactionState>(() => {
    // Restore state from sessionStorage on mount
    if (typeof window !== 'undefined' && userId) {
      try {
        const saved = sessionStorage.getItem(`ludo_deposit_${gameId}_${userId}`);
        if (saved) {
          const data = JSON.parse(saved);
          // Only restore if less than 5 minutes old
          if (Date.now() - data.timestamp < 5 * 60 * 1000) {
            return data.state as TransactionState;
          }
        }
      } catch {}
    }
    return 'idle';
  });
  
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(() => {
    // Restore txHash from sessionStorage on mount
    if (typeof window !== 'undefined' && userId) {
      try {
        const saved = sessionStorage.getItem(`ludo_deposit_${gameId}_${userId}`);
        if (saved) {
          const data = JSON.parse(saved);
          if (Date.now() - data.timestamp < 5 * 60 * 1000 && data.txHash) {
            return data.txHash as `0x${string}`;
          }
        }
      } catch {}
    }
    return undefined;
  });
  
  const [showRetry, setShowRetry] = useState(false);

  const { toast } = useToast();
  const { sendTransaction } = useSendTransaction();
  const { wallets } = useWallets();
  const { openWallet, isIosPwa } = useWalletDeepLink();
  
  // Helper to save state to sessionStorage
  const saveToStorage = (state: TransactionState, hash?: string) => {
    if (!userId) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        state,
        txHash: hash,
        timestamp: Date.now()
      }));
    } catch {}
  };
  
  // Helper to clear sessionStorage
  const clearStorage = () => {
    if (!userId) return;
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  // Get wallet address
  const wallet = wallets?.[0];

  // Wait for transaction confirmation (2 confirmations for security)
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    isError: isConfirmError 
  } = useWaitForTransactionReceipt({
    hash: txHash,
    confirmations: 2,
  });

  // Update state when confirming
  useEffect(() => {
    if (isConfirming && txHash) {
      setTransactionState('confirming');
    }
  }, [isConfirming, txHash]);

  // Call onDepositSuccess ONLY after on-chain confirmation
  useEffect(() => {
    if (isConfirmed && txHash) {
      setTransactionState('confirmed');
      clearStorage(); // Clear storage on success
      toast({
        title: "Dépôt confirmé !",
        description: "Votre dépôt a été confirmé sur la blockchain.",
      });
      onDepositSuccess?.(txHash);
    }
  }, [isConfirmed, txHash, onDepositSuccess, toast]);

  // Handle confirmation error
  useEffect(() => {
    if (isConfirmError && txHash) {
      setTransactionState('error');
      clearStorage(); // Clear storage on confirmation error
      toast({
        title: "Confirmation échouée",
        description: "La transaction a peut-être échoué. Vérifiez sur PolygonScan.",
        variant: "destructive",
      });
      setTxHash(undefined);
    }
  }, [isConfirmError, txHash, toast]);

  // showRetry stays visible until user acts - no auto-hide

  const ensureWalletReady = async () => {
    if (!wallets || wallets.length === 0) {
      toast({
        title: "Wallet non connecté",
        description: "Veuillez connecter votre wallet pour continuer.",
        variant: "destructive",
      });
      throw new Error("No wallet connected");
    }

    const wallet = wallets[0];
    if (!wallet) {
      throw new Error("No wallet available");
    }

    // Switch to Polygon mainnet
    try {
      await wallet.switchChain(polygon.id);
    } catch (e) {
      toast({
        title: "Changement de réseau requis",
        description: "Veuillez passer sur Polygon et réessayer.",
        variant: "destructive",
      });
      throw e;
    }

    return wallet;
  };

  const isUserCancellation = (error: unknown): boolean => {
    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      return msg.includes('rejected') || 
             msg.includes('denied') || 
             msg.includes('cancelled') ||
             msg.includes('user refused') ||
             msg.includes('user declined');
    }
    if (typeof error === 'object' && error !== null && 'code' in error) {
      return (error as { code: number }).code === 4001;
    }
    return false;
  };

  const handleDeposit = async () => {
    try {
      // Reset state if coming from cancelled/error - allows direct retry
      if (transactionState === 'cancelled' || transactionState === 'error') {
        setTransactionState('idle');
        setShowRetry(false);
        setTxHash(undefined);
      }
      
      setTransactionState('wallet-pending');
      saveToStorage('wallet-pending'); // Save immediately before wallet interaction
      setShowRetry(false);
      const activeWallet = await ensureWalletReady();

      // Encode ERC-20 transfer call (USDT has 6 decimals)
      const data = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'transfer',
        args: [DEPOSIT_ADDRESS, parseUnits(betAmount.toString(), 6)]
      });

      // Send USDT transfer transaction with explicit chainId for Privy
      const result = await sendTransaction(
        { 
          to: USDT_CONTRACT, 
          data,
          value: 0n, // Explicit: no native token transfer - helps MetaMask identify as ERC-20 transfer
          chainId: polygon.id,
        },
        { address: activeWallet.address }
      );

      const hash = result.hash as `0x${string}`;
      
      // Save txHash to DB immediately (before waiting for confirmation)
      // This ensures state is preserved if user refreshes
      if (userId) {
        await supabase
          .from('ludo_game_players')
          .update({
            tx_hash: hash,
            deposit_status: 'pending',
          } as any)
          .eq('game_id', gameId)
          .eq('user_id', userId);
      }
      
      setTxHash(hash);
      setTransactionState('tx-pending');
      saveToStorage('tx-pending', hash); // Save with hash after tx sent

      toast({
        title: "Transaction envoyée",
        description: "En attente de confirmation blockchain (2 blocs)...",
      });
    } catch (error) {
      console.error("USDT deposit failed:", error);
      
      if (isUserCancellation(error)) {
        setTransactionState('cancelled');
        setShowRetry(true);
        clearStorage(); // Clear storage on user cancellation
        toast({
          title: "Transaction annulée",
          description: "Pas de souci ! Vous pouvez réessayer quand vous voulez.",
        });
      } else {
        setTransactionState('error');
        setShowRetry(true);
        clearStorage(); // Clear storage on error
        toast({
          title: "Dépôt échoué",
          description: "La transaction a échoué. Veuillez réessayer.",
          variant: "destructive",
        });
      }
    }
  };

  const handleRetry = () => {
    setTransactionState('idle');
    setShowRetry(false);
    setTxHash(undefined);
    clearStorage(); // Clear on retry
  };

  // Transaction sent - waiting for confirmation (pending state)
  if (txHash && (transactionState === 'tx-pending' || transactionState === 'confirming')) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 p-6 rounded-2xl border border-warning/30 bg-warning/10"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-16 h-16 text-warning" />
        </motion.div>
        <div className="text-center">
          <p className="text-lg font-semibold text-warning">
            {transactionState === 'confirming' ? 'Confirmation blockchain...' : 'Transaction envoyée...'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {transactionState === 'confirming' ? 'Attente de 2 confirmations' : 'Attente du réseau'}
          </p>
        </div>
        
        {/* Progress indicator */}
        <div className="flex items-center gap-2 w-full max-w-[200px]">
          <div className="h-1 flex-1 rounded-full bg-success" />
          <div className={cn(
            "h-1 flex-1 rounded-full transition-colors duration-500",
            transactionState === 'confirming' ? "bg-success" : "bg-muted"
          )} />
          <div className="h-1 flex-1 rounded-full bg-muted" />
        </div>
        <div className="flex justify-between w-full max-w-[200px] text-[10px] text-muted-foreground">
          <span>Wallet</span>
          <span>Transaction</span>
          <span>Confirmé</span>
        </div>
        
        {/* iOS PWA: Open Wallet button */}
        {isIosPwa && (
          <Button
            variant="outline"
            size="sm"
            onClick={openWallet}
            className="rounded-full"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Ouvrir le Wallet
          </Button>
        )}
        
        <a 
          href={`https://polygonscan.com/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline"
        >
          Voir tx: {txHash.slice(0, 10)}...{txHash.slice(-8)}
        </a>
      </motion.div>
    );
  }

  // Already confirmed via real-time
  if (hasDeposited || transactionState === 'confirmed') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 p-6 rounded-2xl border border-success/30 bg-success/10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
        >
          <CheckCircle className="w-16 h-16 text-success" />
        </motion.div>
        <div className="text-center">
          <p className="text-lg font-semibold text-success">Dépôt confirmé</p>
          <p className="text-sm text-muted-foreground mt-1">
            {betAmount} USDT envoyé
          </p>
        </div>
      </motion.div>
    );
  }

  const hasWalletConnected = wallets && wallets.length > 0;
  const isLoading = transactionState === 'wallet-pending';

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Amount display */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Montant à déposer</p>
        <p className="text-3xl font-bold">{betAmount} USDT</p>
        <p className="text-xs text-muted-foreground mt-1">Réseau Polygon</p>
      </div>

      {/* Cancelled/Error state message (no separate button - main button handles retry) */}
      <AnimatePresence>
        {(transactionState === 'cancelled' || transactionState === 'error') && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "flex items-center gap-2 p-3 rounded-lg border",
              transactionState === 'cancelled' 
                ? "bg-muted/50 border-muted-foreground/20" 
                : "bg-destructive/10 border-destructive/20"
            )}
          >
            {transactionState === 'cancelled' ? (
              <XCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
            )}
            <p className={cn(
              "text-xs",
              transactionState === 'cancelled' ? "text-muted-foreground" : "text-destructive"
            )}>
              {transactionState === 'cancelled' 
                ? "Transaction annulée" 
                : "La transaction a échoué"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deposit Button with glow effect */}
      <motion.div 
        className="w-full relative"
        animate={transactionState === 'cancelled' ? { x: [-8, 8, -8, 8, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <Button
          onClick={handleDeposit}
          disabled={isLoading}
          size="lg"
          className={cn(
            "w-full h-14 text-base font-semibold relative overflow-hidden transition-all duration-300",
            !hasWalletConnected && "bg-muted text-muted-foreground",
            hasWalletConnected && !isLoading && [
              "bg-gradient-to-r from-success to-emerald-500",
              "hover:from-success/90 hover:to-emerald-500/90",
              "shadow-lg shadow-success/25",
              "text-success-foreground"
            ],
            transactionState === 'wallet-pending' && "bg-warning text-warning-foreground"
          )}
        >
          {/* Glow shimmer effect */}
          {hasWalletConnected && !isLoading && transactionState === 'idle' && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          )}
          
          <span className="relative z-10 flex items-center justify-center">
            {transactionState === 'wallet-pending' ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Confirmation wallet...
              </>
            ) : transactionState === 'cancelled' ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2" />
                Réessayer le dépôt
              </>
            ) : transactionState === 'error' ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2" />
                Réessayer
              </>
            ) : !hasWalletConnected ? (
              <>
                <Wallet className="w-5 h-5 mr-2" />
                Connecter le wallet
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5 mr-2" />
                Déposer {betAmount} USDT
              </>
            )}
          </span>
        </Button>
      </motion.div>

      {/* Info */}
      <p className="text-xs text-muted-foreground text-center">
        Les fonds seront envoyés au pot de la partie
      </p>
    </div>
  );
};
