// Unified Wallet Types - Consolidates wallet-related interfaces

import { BaseTransactionData } from './base';

// External wallet state (from SimpleWalletState)
export interface ExternalWalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  isModalOpen: boolean;
}


// Combined wallet state (external-only)
export interface WalletState {
  external: ExternalWalletState;
  isLoading: boolean;
  hasAnyWallet: boolean;
}

// Wallet actions (external-only)
export interface WalletActions {
  connectExternal: () => Promise<void>;
  disconnectExternal: () => Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
  getWalletBalance: () => Promise<number>;
}



// Transaction interface extending base
export interface Transaction extends BaseTransactionData {
  from_address?: string;
  to_address?: string;
  hash?: string;
  network?: string;
  fee?: number;
  confirmations?: number;
}

// Crypto options for deposits/withdrawals
export interface CryptoOption {
  id: string;
  name: string;
  symbol: string;
  address: string;
  network: string;
  icon?: string;
  decimals?: number;
}

// Withdrawal/Deposit types
export type CryptoType = 'bitcoin' | 'ethereum' | 'usdt' | 'usdc';
export type WithdrawalMethod = 'bank-transfer' | 'mobile-money' | 'crypto' | 'paypal' | 'credit-card' | 'apple-pay';
export type MobileProvider = 'orange' | 'mtn' | 'wave' | 'mpesa' | 'airtel';

// Withdrawal request
export interface WithdrawalRequest extends BaseTransactionData {
  user_id: string;
  method: WithdrawalMethod;
  mobile_provider?: MobileProvider;
  phone_number?: string;
  crypto_address?: string;
  crypto_type?: CryptoType;
  bank_account?: string;
  routing_number?: string;
  account_name?: string;
}