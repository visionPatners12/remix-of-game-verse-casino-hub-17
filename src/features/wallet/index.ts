/**
 * Wallet Feature - Modular Architecture
 * 
 * This feature provides a complete wallet management system including:
 * - Wallet connection and authentication
 * - Balance tracking (tokens via ThirdWeb)
 * - Transaction history
 * - UI components and pages
 * 
 * @version 2.0.0
 * @architecture Modular Feature-Based
 */

// Types
export * from './types';

// Hooks
export { useUnifiedWallet, useWalletTokensThirdWeb } from './hooks';

// Components
export { OptimizedWalletPage, ReactiveWalletCard, ReactiveTransactionsList } from './components';

// Services
export { blockchainUtils, transactionService } from './services';

// Utils
export { walletUtils } from './utils';
