
import { useState } from 'react';
import { WithdrawalMethod, MobileProvider, WithdrawalRequest, CryptoOption, CryptoType } from '@/types/wallet';
import { WalletToken } from '@/features/wallet/types';
import { cryptoOptions } from '../config/crypto';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';
import { isAddress, erc20Abi, parseUnits, encodeFunctionData } from 'viem';
import { useBalance, usePublicClient } from 'wagmi';
import { useAccount } from '@azuro-org/sdk-social-aa-connector';
import { useChain } from "@azuro-org/sdk";
import { useSendTransaction, useWallets, usePrivy } from '@privy-io/react-auth';

export const useWithdraw = () => {
  const [currentStep, setCurrentStep] = useState(0); // Start at 0 for token selection
  const [selectedToken, setSelectedToken] = useState<WalletToken | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<WithdrawalMethod | null>(null);
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mobileProvider, setMobileProvider] = useState<MobileProvider>('orange');
  const [cryptoAddress, setCryptoAddress] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption>(cryptoOptions[0]);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const account = useAccount();
  const chain = useChain();
  const publicClient = usePublicClient();
  const { sendTransaction } = useSendTransaction();
  const { wallets } = useWallets();
  const { ready, authenticated } = usePrivy();
  
  const address = account.address;
  const appChain = chain.appChain;
  const betToken = chain.betToken;
  
  const balance = useBalance({
    chainId: appChain?.id,
    address,
    token: betToken?.address,
  });
  
  const walletBalance = balance.data;
  const refetchBalance = balance.refetch;

  const handleMethodSelect = (method: WithdrawalMethod) => {
    setSelectedMethod(method);
  };

  const handleNextStep = async () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };


  // Ensure wallet is ready for Privy transactions
  const ensureWalletReady = async (): Promise<typeof wallets[0]> => {
    logger.wallet('🔍 Checking Privy wallet readiness');
    
    if (!ready || !authenticated) {
      throw new Error('Wallet not authenticated. Please connect your wallet first.');
    }

    if (!wallets || wallets.length === 0) {
      throw new Error('No wallets available. Please connect a wallet.');
    }

    const activeWallet = wallets[0];
    if (!activeWallet) {
      throw new Error('No active wallet found.');
    }

    // Switch to correct chain if needed
    if (activeWallet.chainId !== `eip155:${appChain.id}`) {
      logger.wallet('🔄 Switching to correct chain:', appChain.id);
      try {
        await activeWallet.switchChain(appChain.id);
      } catch (error) {
        logger.error('❌ Failed to switch chain:', error);
        throw new Error(`Failed to switch to ${appChain.name}. Please try again.`);
      }
    }

    return activeWallet;
  };

  const executeBlockchainWithdraw = async () => {
    logger.wallet('🚀 Starting Privy blockchain withdrawal');
    logger.wallet('Parameters:', { amount, cryptoAddress, selectedCrypto, betToken });

    if (!sendTransaction) {
      logger.error('❌ Send transaction function not available');
      toast({
        title: "Connection Error",
        description: "Send transaction function not available.",
        variant: "destructive"
      });
      return;
    }

    if (!publicClient) {
      logger.error('❌ Public client not available');
      toast({
        title: "Connection Error",
        description: "Public client not available.",
        variant: "destructive"
      });
      return;
    }

    const fixedAmount = (+amount).toFixed(betToken.decimals);
    const rawAmount = parseUnits(fixedAmount, betToken.decimals);
    
    logger.wallet('💰 Amount calculations:', { fixedAmount, rawAmount: rawAmount.toString() });

    setIsSubmitting(true);

    try {
      // Ensure wallet is ready and get the wallet address
      const activeWallet = await ensureWalletReady();
      const walletAddress = activeWallet.address as `0x${string}`;

      // Encode the ERC20 transfer call
      const data = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'transfer',
        args: [cryptoAddress as `0x${string}`, rawAmount],
      });

      logger.wallet('📤 Sending Privy transaction:', {
        to: betToken.address,
        data,
        chainId: appChain.id,
        walletAddress
      });

      // Send transaction using Privy with wallet address
      const response = await sendTransaction(
        {
          to: betToken.address as `0x${string}`,
          data,
          chainId: appChain.id,
        },
        { address: walletAddress }
      );

      const hash = response.hash as `0x${string}`;
      logger.wallet('✅ Transaction sent! Hash:', hash);
      setTxHash(hash);

      logger.wallet('⏳ Waiting for transaction receipt...');
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
      });

      logger.wallet('🎉 Transaction confirmed! Receipt:', receipt);
      
      toast({
        title: "Withdrawal Confirmed",
        description: `Successfully withdrew ${amount} ${selectedCrypto.symbol}.`,
      });

      refetchBalance();
      return hash;
    } catch (error: unknown) {
      logger.error('❌ Privy blockchain error:', error);
      
      // Handle specific Privy errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('User rejected')) {
        toast({
          title: "Transaction Cancelled",
          description: "You cancelled the transaction.",
          variant: "destructive"
        });
      } else if (errorMessage.includes('Insufficient funds')) {
        toast({
          title: "Insufficient Funds",
          description: "You don't have enough funds for this transaction.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Transaction Error",
          description: "The blockchain transaction failed. Please try again.",
          variant: "destructive"
        });
      }
      throw error;
    } finally {
      setIsSubmitting(false);
      logger.wallet('🏁 Transaction process completed');
    }
  };

  const createWithdrawalRequest = (): Partial<WithdrawalRequest> => ({
    method: selectedMethod!,
    amount: parseFloat(amount),
    phone_number: phoneNumber,
    mobile_provider: mobileProvider,
    crypto_address: cryptoAddress,
    crypto_type: selectedCrypto.symbol.toLowerCase() as CryptoType
  });

  return {
    currentStep,
    selectedToken,
    setSelectedToken,
    selectedMethod,
    amount,
    phoneNumber,
    mobileProvider,
    cryptoAddress,
    selectedCrypto,
    otp,
    isLoading,
    isSubmitting,
    txHash,
    walletBalance,
    address,
    setAmount,
    setPhoneNumber,
    setMobileProvider,
    setCryptoAddress,
    setSelectedCrypto,
    setOtp,
    handleMethodSelect,
    handleNextStep,
    handlePrevStep,
    executeBlockchainWithdraw,
    createWithdrawalRequest
  };
};
