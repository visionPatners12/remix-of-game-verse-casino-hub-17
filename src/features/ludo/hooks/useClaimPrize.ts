import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type ClaimStatus = 'received' | 'pending_confirmations' | 'confirmed' | 'mismatch' | 'reverted' | 'timeout' | null;

export const useClaimPrize = () => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const claimPrize = async (gameId: string, force = false) => {
    setIsPending(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('ludo-game', {
        body: { 
          action: 'claimPrize', 
          gameId, 
          force 
        }
      });

      if (invokeError) {
        throw new Error(invokeError.message);
      }

      // Check for backend error response (using ok instead of success)
      if (!data?.ok) {
        const errorCode = data?.code;
        const errorMessage = data?.error || 'Claim failed';
        
        // Handle specific error codes
        if (errorCode === 'FORBIDDEN') {
          throw new Error('Only the winner can claim the prize');
        } else if (errorCode === 'BAD_STATE') {
          if (errorMessage.includes('not finished')) {
            throw new Error('Game is not finished yet');
          } else if (errorMessage.includes('no wallet_address')) {
            throw new Error('Winner has no wallet address configured');
          }
          throw new Error(errorMessage);
        }
        
        throw new Error(errorMessage);
      }

      // Handle successful responses based on action type
      const action = data.action;
      const claimStatus = data.claim_status;
      const claimRef = data.claim_ref;

      if (action === 'enqueued') {
        toast({
          title: "Claim initiated",
          description: "Your prize payout has been queued for processing...",
        });
      } else if (action === 'checked') {
        if (claimStatus === 'pending_confirmations') {
          toast({
            title: "Payout in progress",
            description: "Your payout is awaiting blockchain confirmations...",
          });
        } else if (claimStatus === 'received') {
          toast({
            title: "Processing",
            description: "Your payout is being processed...",
          });
        }
      } else if (action === 'already_confirmed') {
        toast({
          title: "Already claimed",
          description: "Your prize has already been paid out!",
        });
      }

      return { 
        success: true, 
        claimRef, 
        claimStatus, 
        action 
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to claim prize';
      setError(message);
      toast({
        title: "Claim failed",
        description: message,
        variant: "destructive"
      });
      return { success: false, error: message };
    } finally {
      setIsPending(false);
    }
  };

  return { claimPrize, isPending, error };
};
