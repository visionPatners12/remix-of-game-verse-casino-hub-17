
// Types pour les tables du schéma app_payments
export interface Wallet {
  id: string;
  user_id: string;
  real_balance: number;
  bonus_balance: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  amount: number;
  type: 'Deposit' | 'Withdrawal' | 'Stake' | 'Winnings' | 'Bonus' | 'StorePurchase' | 'ReferralReward';
  source_balance: 'real' | 'bonus';
  status: 'Pending' | 'Success' | 'Failed' | 'Rejected';
  description?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

export interface CryptoPayment {
  id: string;
  transaction_id?: string;
  payment_id: string;
  pay_address: string;
  pay_currency: string;
  pay_amount: number;
  network?: string;
  status: string;
  order_id?: string;
  payin_extra_id?: string;
  created_at: string;
  updated_at: string;
}

interface MobileMoneyTransaction {
  id: string;
  transaction_id: string;
  phone_number: string;
  amount: number;
  currency: string;
  mobile_provider: string;
  notchpay_reference: string;
  notchpay_payment_id?: string;
  notchpay_status: string;
  notchpay_data?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface CurrencyRate {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  created_at: string;
  updated_at: string;
}

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  fee: number;
  method: string;
  provider?: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  reference: string;
  created_at: string;
  updated_at: string;
}

// Types pour les insertions
type WalletInsert = Omit<Wallet, 'id' | 'created_at' | 'updated_at'>;
type TransactionInsert = Omit<Transaction, 'id' | 'created_at' | 'updated_at'>;
type CryptoPaymentInsert = Omit<CryptoPayment, 'id' | 'created_at' | 'updated_at'>;
type MobileMoneyTransactionInsert = Omit<MobileMoneyTransaction, 'id' | 'created_at' | 'updated_at'>;
type CurrencyRateInsert = Omit<CurrencyRate, 'id' | 'created_at' | 'updated_at'>;

// Types pour les mises à jour
type WalletUpdate = Partial<Omit<Wallet, 'id' | 'created_at' | 'updated_at'>>;
type TransactionUpdate = Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>;
type CryptoPaymentUpdate = Partial<Omit<CryptoPayment, 'id' | 'created_at' | 'updated_at'>>;

// Types enrichis avec relations
interface WalletWithTransactions extends Wallet {
  transactions?: Transaction[];
}

interface TransactionWithWallet extends Transaction {
  wallet?: Wallet;
}

// Types pour les hooks
export interface UseWalletOptions {
  enableTransactions?: boolean;
  enableWithdrawals?: boolean;
}

export interface WalletQueryResult {
  wallet: Wallet | null;
  transactions: Transaction[];
  withdrawalRequests: WithdrawalRequest[];
  isLoading: boolean;
  error: Error | null;
  hasSession: boolean;
  isAuthenticated: boolean;
}
