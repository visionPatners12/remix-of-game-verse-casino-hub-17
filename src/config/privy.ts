import { type PrivyConfig } from '@azuro-org/sdk-social-aa-connector';
import { polygon, base } from 'wagmi/chains';
import { WALLETCONNECT_PROJECT_ID } from './constants';

export const privyConfig: PrivyConfig = {
  walletConnectCloudProjectId: WALLETCONNECT_PROJECT_ID,
  supportedChains: [polygon, base],
  defaultChain: polygon,
  loginMethods: ['sms', 'email', 'wallet'],
  appearance: {
    theme: 'dark',
    showWalletLoginFirst: false, // SMS/WhatsApp first
    walletList: ['metamask', 'coinbase_wallet', 'wallet_connect', 'rainbow'],
    walletChainType: 'ethereum-only',
  },
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
    requireUserPasswordOnCreate: false,
    showWalletUIs: false,
  },
};
