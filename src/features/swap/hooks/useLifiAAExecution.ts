// Hook for executing LI.FI swaps via Smart Account (AA)
import { useState, useCallback } from 'react';
import { getStepTransaction, getStatus, type Route } from '@lifi/sdk';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';
import { encodeFunctionData, erc20Abi, createPublicClient, http, type Chain } from 'viem';
import { polygon, base, arbitrum, optimism, mainnet } from 'viem/chains';
import type { SwapExecutionStep, SwapStatus } from '../types';
import { toast } from 'sonner';

// Chain mapping for public clients
const CHAINS: Record<number, Chain> = {
  1: mainnet,
  137: polygon,
  8453: base,
  42161: arbitrum,
  10: optimism,
};

interface UseLifiAAExecutionOptions {
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
}

// Native token address (zero address)
const NATIVE_TOKEN = '0x0000000000000000000000000000000000000000';
const NATIVE_TOKEN_EEE = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

function isNativeToken(address: string): boolean {
  const lower = address.toLowerCase();
  return lower === NATIVE_TOKEN || lower === NATIVE_TOKEN_EEE;
}

export function useLifiAAExecution({ onSuccess, onError }: UseLifiAAExecutionOptions = {}) {
  const { client: smartWalletClient } = useSmartWallets();
  const [status, setStatus] = useState<SwapStatus>('idle');
  const [steps, setSteps] = useState<SwapExecutionStep[]>([]);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check token allowance
  const checkAllowance = useCallback(async (
    tokenAddress: string,
    owner: string,
    spender: string,
    chainId: number
  ): Promise<bigint> => {
    const chain = CHAINS[chainId];
    if (!chain) return BigInt(0);

    try {
      const publicClient = createPublicClient({
        chain,
        transport: http(),
      });

      // Cast to any to avoid strict viem typing issues
      const allowance = await (publicClient as any).readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [owner, spender],
      });
      return BigInt(allowance);
    } catch (err) {
      console.error('Error checking allowance:', err);
      return BigInt(0);
    }
  }, []);

  const execute = useCallback(async (route: Route, fromAddress: string) => {
    if (!route) {
      setError('Missing route');
      return;
    }

    if (!smartWalletClient) {
      setError('Smart Wallet client not available');
      return;
    }

    setStatus('executing');
    setError(null);
    setTxHash(null);

    // Initialize step tracking
    const initialSteps: SwapExecutionStep[] = route.steps.map((step, index) => ({
      id: `step-${index}`,
      type: step.type === 'lifi' ? 'bridge' : 'swap',
      status: 'pending',
      message: `${step.type === 'lifi' ? 'Bridging' : 'Swapping'} via ${step.tool}`,
    }));
    setSteps(initialSteps);

    let lastTxHash: string | null = null;

    try {
      for (let i = 0; i < route.steps.length; i++) {
        const step = route.steps[i];
        
        // Update step status to active
        setSteps(prev => prev.map((s, idx) => 
          idx === i ? { ...s, status: 'active' } : s
        ));

        // Get transaction data from LI.FI
        const stepWithTx = await getStepTransaction(step);
        
        if (!stepWithTx.transactionRequest) {
          throw new Error(`No transaction request for step ${i + 1}`);
        }

        const { to, data, value } = stepWithTx.transactionRequest;

        // Build calls array for batched execution
        const calls: Array<{ to: `0x${string}`; data?: `0x${string}`; value?: bigint }> = [];

        // Check if we need to approve (for ERC20 tokens, not native)
        const fromTokenAddress = step.action.fromToken.address;
        if (!isNativeToken(fromTokenAddress)) {
          // Get approval address from estimate
          const approvalAddress = step.estimate?.approvalAddress || to;
          
          const allowance = await checkAllowance(
            fromTokenAddress,
            fromAddress,
            approvalAddress as string,
            step.action.fromChainId
          );
          
          const requiredAmount = BigInt(step.action.fromAmount);
          
          if (allowance < requiredAmount) {
            console.log('[AA Execution] Adding approval call for', fromTokenAddress);
            // Add approval for required amount (with small buffer)
            calls.push({
              to: fromTokenAddress as `0x${string}`,
              data: encodeFunctionData({
                abi: erc20Abi,
                functionName: 'approve',
                args: [approvalAddress as `0x${string}`, requiredAmount * BigInt(2)],
              }),
            });
          }
        }

        // Add the main swap/bridge call
        calls.push({
          to: to as `0x${string}`,
          data: data as `0x${string}`,
          value: value ? BigInt(value.toString()) : undefined,
        });

        console.log('[AA Execution] Executing step', i + 1, 'with', calls.length, 'calls');

        // Execute via Smart Wallet (batched if approval needed)
        // Use sendTransaction with calls array for batched UserOperation
        const hash = await (smartWalletClient as any).sendTransaction({
          account: smartWalletClient.account,
          calls,
        });

        lastTxHash = hash;
        setTxHash(hash);

        // Wait for transaction status
        let txStatus = 'PENDING';
        let attempts = 0;
        const maxAttempts = 60; // 5 minutes max wait

        while (txStatus !== 'DONE' && txStatus !== 'FAILED' && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
          
          try {
            const result = await getStatus({
              txHash: hash,
              fromChain: step.action.fromChainId,
              toChain: step.action.toChainId,
              bridge: step.tool,
            });
            txStatus = result.status;
            console.log('[AA Execution] Status:', txStatus);
          } catch (statusErr) {
            console.warn('[AA Execution] Status check error:', statusErr);
          }
          
          attempts++;
        }

        if (txStatus === 'FAILED') {
          throw new Error(`Transaction failed for step ${i + 1}`);
        }

        // Update step as completed
        setSteps(prev => prev.map((s, idx) => 
          idx === i ? { ...s, status: 'completed', txHash: hash } : s
        ));
      }

      setStatus('success');
      toast.success('Swap completed successfully!');
      onSuccess?.(lastTxHash || '');

    } catch (err: any) {
      console.error('[AA Execution] Error:', err);
      
      // Check if it's an AA-incompatible route error
      const errorMessage = err.message || 'Swap failed';
      const isSignatureError = errorMessage.toLowerCase().includes('signature') || 
                               errorMessage.toLowerCase().includes('signer') ||
                               errorMessage.toLowerCase().includes('unauthorized');
      
      if (isSignatureError) {
        setError('This route requires an external wallet. Please transfer funds to your signer wallet.');
      } else {
        setError(errorMessage);
      }
      
      setStatus('error');
      
      // Mark current step as failed
      setSteps(prev => prev.map(s => 
        s.status === 'active' ? { ...s, status: 'failed' } : s
      ));
      
      toast.error('Swap failed', {
        description: errorMessage,
      });
      
      onError?.(err);
    }
  }, [smartWalletClient, checkAllowance, onSuccess, onError]);

  const reset = useCallback(() => {
    setStatus('idle');
    setSteps([]);
    setTxHash(null);
    setError(null);
  }, []);

  return {
    status,
    steps,
    txHash,
    error,
    execute,
    reset,
    isExecuting: status === 'executing',
    isAAReady: !!smartWalletClient,
  };
}
