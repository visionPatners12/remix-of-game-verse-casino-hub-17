import { http, createStorage } from 'wagmi';
import { createConfig } from '@privy-io/wagmi';
import { injected } from 'wagmi/connectors';
import { polygon, base } from 'wagmi/chains';
import { PRYZEN_APP, getOrigin } from './constants';

// Configuration wagmi simplifiée pour PWA
// - Privy gère WalletConnect - pas de double initialisation
// - Uniquement injected() pour MetaMask browser extension
// - localStorage pour persistance fiable sur iOS PWA
export const wagmiConfig = createConfig({
  chains: [polygon, base],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
    // WalletConnect est géré par Privy - ne pas initialiser ici
  ],
  ssr: false,
  syncConnectedChain: true,
  multiInjectedProviderDiscovery: true,
  transports: {
    [polygon.id]: http('https://polygon-mainnet.infura.io/v3/4a9defd4655c4958b48ebfb8cc63f2e9'),
    [base.id]: http('https://base-mainnet.infura.io/v3/4a9defd4655c4958b48ebfb8cc63f2e9'),
  },
  storage: createStorage({
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    key: 'wagmi.pryzen',
  }),
});
