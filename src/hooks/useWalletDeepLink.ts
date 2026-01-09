import { useCallback, useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { isIosPwa, isMobilePwa, openWalletSimple, WALLET_NAME_MAP } from '@/utils/walletDeepLink';

export function useWalletDeepLink() {
  const { wallets } = useWallets();
  const [isOpening, setIsOpening] = useState(false);

  // Check if we're on a mobile device (not just PWA)
  const isMobile = typeof navigator !== 'undefined' && 
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Check if the wallet is an external wallet (not embedded Privy)
  const wallet = wallets[0];
  const isExternalWallet = wallet && wallet.walletClientType !== 'privy';

  const openWallet = useCallback(async () => {
    if (!wallet) return false;

    setIsOpening(true);
    try {
      // Map Privy wallet type to WalletConnect Explorer name
      const walletType = wallet.walletClientType;
      const walletName = WALLET_NAME_MAP[walletType] ?? walletType;

      return await openWalletSimple({ walletName });
    } catch (error) {
      console.error('Failed to open wallet:', error);
      return false;
    } finally {
      setIsOpening(false);
    }
  }, [wallet]);

  // Should we show wallet open button? (mobile + external wallet)
  const shouldShowOpenWallet = isMobile && wallets.length > 0 && isExternalWallet;

  return {
    openWallet,
    isOpening,
    isIosPwa: isIosPwa(),
    isMobilePwa: isMobilePwa(),
    isMobile,
    hasWallet: wallets.length > 0,
    isExternalWallet,
    shouldShowOpenWallet,
  };
}
