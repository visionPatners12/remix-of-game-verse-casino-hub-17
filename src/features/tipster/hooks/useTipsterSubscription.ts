import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useSendTransaction, useWallets } from '@privy-io/react-auth';
import { encodeFunctionData, parseUnits, erc20Abi } from 'viem';
import { polygon } from 'viem/chains';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

const USDT_POLYGON = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' as const;

export function useTipsterSubscription() {
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { sendTransaction } = useSendTransaction();
  const { wallets } = useWallets();

  const ensureWalletReady = async () => {
    if (!wallets || wallets.length === 0) {
      toast({
        title: "Wallet connection",
        description: "No wallet connected.",
        variant: "destructive",
      });
      throw new Error("No wallet connected");
    }

    const wallet = wallets[0];
    if (!wallet) {
      throw new Error("No wallet available");
    }

    try {
      await wallet.switchChain(polygon.id);
    } catch (e) {
      toast({
        title: "Network switch required",
        description: "Please switch to Polygon (137) and try again.",
        variant: "destructive",
      });
      throw e;
    }

    return wallet;
  };

  const subscribe = async (tipsterId: string, monthlyPrice: number, splitContractAddress: string) => {
    // 🔴 DEBUG TOAST
    toast({
      title: "🔴 Subscribe called",
      description: `tipsterId: ${tipsterId?.substring(0, 12)}... (len: ${tipsterId?.length})`,
    });
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to subscribe",
        variant: "destructive",
      });
      return false;
    }

    if (!tipsterId || typeof tipsterId !== 'string' || tipsterId.length < 10) {
      toast({
        title: "Error",
        description: "Invalid tipster ID",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsPending(true);

      // Verify tipster exists BEFORE crypto transaction
      const { data: tipsterCheck, error: checkError } = await supabase
        .from('tipster_profiles')
        .select('id, user_id')
        .eq('id', tipsterId)
        .maybeSingle();

      // 🔴 DEBUG TOAST - DB check result
      toast({
        title: tipsterCheck ? "✅ Tipster found in DB" : "❌ Tipster NOT FOUND",
        description: tipsterCheck 
          ? `Found ID: ${tipsterCheck.id.substring(0, 12)}...` 
          : `Query ID: ${tipsterId?.substring(0, 12)}...`,
        variant: tipsterCheck ? "default" : "destructive",
      });

      if (!tipsterCheck) {
        toast({
          title: "Error",
          description: "This tipster does not exist",
          variant: "destructive",
        });
        return false;
      }
      
      if (tipsterCheck.id !== tipsterId) {
        toast({
          title: "Error",
          description: "ID mismatch error",
          variant: "destructive",
        });
        return false;
      }

      const wallet = await ensureWalletReady();
      
      const targetAddress = splitContractAddress as `0x${string}`;
      
      // Encode transfer function call for USDT (6 decimals)
      const data = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'transfer',
        args: [targetAddress, parseUnits(monthlyPrice.toString(), 6)],
      });

      // Send USDT transaction using Privy with explicit chainId
      const result = await sendTransaction(
        { 
          to: USDT_POLYGON, 
          data,
          chainId: polygon.id, // Required for Privy to display token correctly
        },
        { address: wallet.address }
      );
      
      setHash(result.hash);
      setIsSuccess(true);
      
      // Get fresh session for insert
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error("Session expired");
      }

      // 🔴 DEBUG TOAST - Right before INSERT
      toast({
        title: "🔴 ABOUT TO INSERT",
        description: `tipster_profile_id: ${tipsterId?.substring(0, 12)}...`,
      });

      // Create subscription record with pending status
      const { error } = await supabase
        .from('tipster_subscriptions')
        .insert({
          subscriber_id: session.user.id,
          tipster_profile_id: tipsterId,
          status: 'pending',
          tx_hash: result.hash,
          amount: monthlyPrice,
          from_address: wallet.address
        });

      if (error) {
        toast({
          title: "Error",
          description: `Payment OK but registration failed: ${error.code} - ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Transaction sent",
        description: "Your subscription will be activated after on-chain confirmation",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "USDT payment failed",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsPending(false);
    }
  };

  const reset = () => {
    setHash(undefined);
    setIsPending(false);
    setIsSuccess(false);
  };

  return {
    hash,
    isPending,
    isSuccess,
    subscribe,
    reset
  };
}