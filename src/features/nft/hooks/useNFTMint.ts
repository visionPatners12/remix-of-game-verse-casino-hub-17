import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedWallet } from '@/features/wallet/hooks/core';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { type MintNFTParams } from '../types';

export function useNFTMint() {
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useUnifiedWallet();
  const { isAuthenticated } = useAuth();

  const mintNFT = async (params: MintNFTParams = {}) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please connect your wallet to mint NFT",
        variant: "destructive",
      });
      return { success: false, error: "Not authenticated" };
    }

    if (!address) {
      toast({
        title: "Wallet Required", 
        description: "Please connect your wallet to mint NFT",
        variant: "destructive",
      });
      return { success: false, error: "No wallet address" };
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('nft', {
        body: {
          to: address,
          name: params.name,
          description: params.description,
          attributes: params.attributes || [],
        },
      });

      if (error) {
        console.error('NFT mint error:', error);
        toast({
          title: "Mint Failed",
          description: error.message || "Failed to mint NFT",
          variant: "destructive",
        });
        return { success: false, error: error.message };
      }

      if (data?.success) {
        toast({
          title: "NFT Minted Successfully! 🎉",
          description: `Your betting slip NFT has been sent to your wallet`,
        });
        return { success: true, data };
      } else {
        const errorMsg = data?.error || "Unknown error occurred";
        toast({
          title: "Mint Failed",
          description: errorMsg,
          variant: "destructive",
        });
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      console.error('NFT mint exception:', error);
      const errorMsg = error instanceof Error ? error.message : "Failed to mint NFT";
      toast({
        title: "Mint Failed",
        description: errorMsg,
        variant: "destructive",
      });
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mintNFT,
    isLoading,
  };
}