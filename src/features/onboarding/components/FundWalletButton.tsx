import React, { useState } from 'react';
import { useFundWallet } from '@privy-io/react-auth';
import { base } from 'viem/chains';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUnifiedWallet } from '@/hooks/useUnifiedWallet';
import { TokenUSDC, NetworkBase } from '@web3icons/react';

interface FundWalletButtonProps {
  className?: string;
}

export const FundWalletButton: React.FC<FundWalletButtonProps> = ({ className }) => {
  const { fundWallet } = useFundWallet();
  const { address } = useUnifiedWallet();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleFundWallet = async () => {
    if (!address) {
      toast({
        title: "No wallet connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await fundWallet(address, {
        chain: base,                              // Base mainnet
        asset: { erc20: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' }, // USDC (Base)
        amount: '50',
        defaultFundingMethod: 'card',
        card: { preferredProvider: 'coinbase' }
      });
      
      toast({
        title: "Funding initiated",
        description: "Your wallet funding process has been started",
      });
    } catch (error) {
      console.error('Fund wallet error:', error);
      toast({
        title: "Funding failed",
        description: "Failed to initiate wallet funding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleFundWallet} 
      variant="secondary" 
      className={className}
      disabled={isLoading || !address}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <div className="flex items-center gap-1 mr-2">
          <TokenUSDC variant="branded" size={16} />
          <NetworkBase variant="branded" size={12} />
        </div>
      )}
      {isLoading ? 'Adding USDC...' : 'Add USDC'}
    </Button>
  );
};