import React, { useState } from 'react';
import { useFundWallet } from '@privy-io/react-auth';
import { polygon } from 'viem/chains';
import { Button } from '@/components/ui/button';
import { Wallet, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUnifiedWallet } from '@/hooks/useUnifiedWallet';

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
        chain: polygon,                          // Polygon mainnet
        asset: { erc20: '0xc2132D05D31c914A87C6611C10748AEb04B58e8F' }, // USDT (Polygon)
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
        <Wallet className="h-4 w-4 mr-2" />
      )}
      {isLoading ? 'Adding Funds...' : 'Add Funds'}
    </Button>
  );
};