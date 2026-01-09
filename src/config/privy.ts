import { type PrivyConfig } from '@azuro-org/sdk-social-aa-connector';
import { polygon } from 'wagmi/chains';
import { WALLETCONNECT_PROJECT_ID } from './constants';

export const privyConfig: PrivyConfig = {
  walletConnectCloudProjectId: WALLETCONNECT_PROJECT_ID,
  supportedChains: [polygon],
  defaultChain: polygon,
  loginMethods: ['email', 'wallet', 'sms'],
  appearance: {
    theme: 'dark',
    showWalletLoginFirst: true, // Wallet first for mobile UX
    walletList: ['metamask', 'coinbase_wallet', 'wallet_connect', 'rainbow'],
    walletChainType: 'ethereum-only',
  },
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
    requireUserPasswordOnCreate: false,
    showWalletUIs: false,
  },
};
