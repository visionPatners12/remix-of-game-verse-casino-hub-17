import { WALLETCONNECT_PROJECT_ID } from '@/config/constants';

// Types
export type WalletListing = {
  id: string;
  name: string;
  image_id?: string;
  mobile?: {
    native?: string;
    universal?: string;
  };
};

const WC_EXPLORER = 'https://explorer-api.walletconnect.com/v3';

// Wallet name mapping: Privy walletClientType -> WalletConnect Explorer name
export const WALLET_NAME_MAP: Record<string, string> = {
  metamask: 'MetaMask',
  rainbow: 'Rainbow',
  coinbase_wallet: 'Coinbase Wallet',
  wallet_connect: 'WalletConnect',
  trust: 'Trust Wallet',
  argent: 'Argent',
  imtoken: 'imToken',
  ledger: 'Ledger Live',
  safe: 'Safe',
  zerion: 'Zerion',
  phantom: 'Phantom',
  rabby: 'Rabby Wallet',
  okx: 'OKX Wallet',
  exodus: 'Exodus',
  brave: 'Brave Wallet',
  '1inch': '1inch Wallet',
  crypto_com: 'Crypto.com | DeFi Wallet',
  uniswap: 'Uniswap Wallet',
  bitget: 'Bitget Wallet',
  bybit: 'Bybit Wallet',
  kraken: 'Kraken Wallet',
  blockchain_com: 'Blockchain.com Wallet',
  tokenpocket: 'TokenPocket',
  mathwallet: 'MathWallet',
  safepal: 'SafePal',
  bitkeep: 'BitKeep',
  onto: 'ONTO',
};

export function isIosPwa(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  
  const ua = navigator.userAgent || '';
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isStandalone =
    (navigator as any).standalone === true ||
    window.matchMedia?.('(display-mode: standalone)').matches;
  
  return isIOS && isStandalone;
}

export function isPwaMode(): boolean {
  if (typeof window === 'undefined') return false;
  
  const isStandalone =
    (navigator as any).standalone === true ||
    window.matchMedia?.('(display-mode: standalone)').matches;
  
  return isStandalone;
}

export function isMobilePwa(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
  return isMobile && isPwaMode();
}

function normalizeBaseLink(base?: string): string | null {
  if (!base) return null;
  if (base.endsWith('/')) return base.slice(0, -1);
  return base;
}

function buildWcDeepLink(base: string, wcUri: string): string | null {
  const b = normalizeBaseLink(base);
  if (!b) return null;

  const encoded = encodeURIComponent(wcUri);

  // Custom scheme (e.g., rainbow://)
  if (b.includes('://') && !b.startsWith('http')) {
    const scheme = b.endsWith('://') ? b : b.endsWith(':') ? `${b}//` : `${b}://`;
    return `${scheme}wc?uri=${encoded}`;
  }

  // Universal link (https://...)
  if (b.startsWith('http')) {
    return `${b}/wc?uri=${encoded}`;
  }

  return null;
}

// Build a simple open link (without wcUri) for transaction confirmations
function buildSimpleDeepLink(base: string): string | null {
  const b = normalizeBaseLink(base);
  if (!b) return null;

  // Custom scheme - just open the app
  if (b.includes('://') && !b.startsWith('http')) {
    return b.endsWith('://') ? b : `${b}://`;
  }

  // Universal link
  if (b.startsWith('http')) {
    return b;
  }

  return null;
}

async function fetchWallets(params: {
  projectId: string;
  search?: string;
  entries?: number;
  page?: number;
  platforms?: string;
}): Promise<{ listings: Record<string, WalletListing> }> {
  const url = new URL(`${WC_EXPLORER}/wallets`);
  url.searchParams.set('projectId', params.projectId);
  if (params.search) url.searchParams.set('search', params.search);
  if (params.entries) url.searchParams.set('entries', String(params.entries));
  if (params.page) url.searchParams.set('page', String(params.page));
  if (params.platforms) url.searchParams.set('platforms', params.platforms);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Explorer API error ${res.status}`);
  return await res.json();
}

export async function resolveWalletDeepLink(opts: {
  projectId: string;
  wcUri?: string;
  walletId?: string;
  walletName?: string;
  prefer?: 'universal' | 'native';
}): Promise<{ wallet: WalletListing; link: string | null } | null> {
  const prefer = opts.prefer ?? 'universal';

  let wallet: WalletListing | undefined;

  try {
    if (opts.walletName) {
      const data = await fetchWallets({
        projectId: opts.projectId,
        search: opts.walletName,
        entries: 5,
        page: 1,
        platforms: 'ios,android',
      });
      // Get first matching wallet from listings object
      const listings = Object.values(data.listings);
      wallet = listings[0];
    }

    if (!wallet) return null;

    const universal = wallet.mobile?.universal;
    const native = wallet.mobile?.native;

    let link: string | null = null;

    if (opts.wcUri) {
      // Full WC deep link with URI
      link =
        prefer === 'universal'
          ? buildWcDeepLink(universal ?? '', opts.wcUri) ?? buildWcDeepLink(native ?? '', opts.wcUri)
          : buildWcDeepLink(native ?? '', opts.wcUri) ?? buildWcDeepLink(universal ?? '', opts.wcUri);
    } else {
      // Simple open link (for transaction confirmations)
      link =
        prefer === 'universal'
          ? buildSimpleDeepLink(universal ?? '') ?? buildSimpleDeepLink(native ?? '')
          : buildSimpleDeepLink(native ?? '') ?? buildSimpleDeepLink(universal ?? '');
    }

    return { wallet, link };
  } catch (error) {
    console.error('Failed to resolve wallet deep link:', error);
    return null;
  }
}

/**
 * Open wallet with WalletConnect URI - for initial connection
 */
export async function openWalletForWc(opts: {
  projectId: string;
  wcUri: string;
  walletId?: string;
  walletName?: string;
}): Promise<boolean> {
  const resolved = await resolveWalletDeepLink({
    projectId: opts.projectId,
    wcUri: opts.wcUri,
    walletId: opts.walletId,
    walletName: opts.walletName,
    prefer: 'universal',
  });

  if (!resolved?.link) return false;

  window.location.href = resolved.link;
  return true;
}

/**
 * Open wallet without URI - for transaction confirmations on iOS PWA
 */
export async function openWalletSimple(opts: {
  projectId?: string;
  walletName?: string;
}): Promise<boolean> {
  const projectId = opts.projectId ?? WALLETCONNECT_PROJECT_ID;
  
  if (!opts.walletName) return false;

  const resolved = await resolveWalletDeepLink({
    projectId,
    walletName: opts.walletName,
    prefer: 'universal',
  });

  if (!resolved?.link) return false;

  window.location.href = resolved.link;
  return true;
}
