// Centralized constants for wallet and app configuration

export const WALLETCONNECT_PROJECT_ID = 'cc606cdd3b865e08e0d00d5298337028';

export const PRYZEN_APP = {
  name: 'Pryzen Game',
  description: 'Crypto multiplayer games & on-chain betting',
  tagline: 'Play. Bet. Win Crypto.',
  url: 'https://pryzen.app',
  logo: '/pryzen-logo.png',
  keywords: 'crypto games, multiplayer gaming, on-chain betting, blockchain games, ludo crypto, web3 games',
} as const;

// Get origin safely for SSR/PWA contexts
export const getOrigin = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return PRYZEN_APP.url;
};
