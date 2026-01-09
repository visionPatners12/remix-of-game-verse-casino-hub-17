import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ENSGenerationRequest {
  label: string;
}

interface ENSGenerationResult {
  success: boolean;
  ensName?: string;
  depositAddress?: string;
  message?: string;
  error?: string;
}

export const useENSGeneration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedENS, setGeneratedENS] = useState<string | null>(null);
  const [depositAddress, setDepositAddress] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const { toast } = useToast();

  const autoGenerateENSAndDeposit = async (label: string): Promise<ENSGenerationResult> => {
    setIsLoading(true);
    setGenerationError(null);
    
    try {
      // Validate input
      if (!label) {
        throw new Error('Label is required');
      }

      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Authentication required. Please log in.');
      }

      // Call the edge function with authentication
      const { data, error } = await supabase.functions.invoke('ens-subname', {
        body: { label } as ENSGenerationRequest,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        // Handle specific blockchain errors
        if (error.message?.includes('wallet_address')) {
          throw new Error('No wallet found. Please connect a wallet first.');
        }
        if (error.message?.includes('ADMIN_PRIVATE_KEY')) {
          throw new Error('ENS service not properly configured.');
        }
        if (error.message?.includes('wrapped')) {
          throw new Error('ENS domain not properly configured for subnames.');
        }
        throw new Error(error.message || 'Failed to generate ENS subdomain');
      }

      if (data?.success) {
        setGeneratedENS(data.ensName);
        setDepositAddress(data.depositAddress);
        
        // Show success message with transaction info if available
        if (data.message) {
          toast({
            title: "ENS Subdomain Created",
            description: data.message,
          });
        }
        
        return data;
      } else {
        throw new Error(data?.error || 'Failed to generate ENS subdomain');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setGenerationError(errorMessage);
      
      // Show error toast
      toast({
        title: "ENS Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const resetENS = () => {
    setGeneratedENS(null);
    setDepositAddress(null);
    setGenerationError(null);
  };

  return {
    autoGenerateENSAndDeposit,
    isLoading,
    generatedENS,
    depositAddress,
    generationError,
    resetENS,
  };
};