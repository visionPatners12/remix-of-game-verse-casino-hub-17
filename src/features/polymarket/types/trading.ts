// Trading session types for Polymarket Builder API integration

// OperationType enum (0 = Call, 1 = DelegateCall)
export enum OperationType {
  Call = 0,
  DelegateCall = 1,
}

export interface UserApiCredentials {
  key: string;
  secret: string;
  passphrase: string;
}

// Simplified trading session for Privy wallet
export interface TradingSession {
  address: string; // Wallet address
  timestamp: number; // Session creation timestamp
  // Optional fields for future full integration
  eoaAddress?: string;
  safeAddress?: string;
  credentials?: UserApiCredentials;
  savedAt?: number;
}

export interface OrderParams {
  tokenId: string;
  price: number;
  size: number;
  side: 'BUY' | 'SELL';
  negRisk: boolean;
}

export type TradingStep = 
  | 'idle'
  | 'connecting'
  | 'deriving-safe'
  | 'deploying-safe'
  | 'getting-credentials'
  | 'setting-approvals'
  | 'placing-order'
  | 'ready'
  | 'error';

export interface BuyModalParams {
  marketId: string;
  eventId: string;
  tokenId: string;
  side: 'BUY' | 'SELL';
  outcome: 'YES' | 'NO';
  currentPrice: number;
  buyPrice: number;
  negRisk: boolean;
  marketTitle: string;
  eventTitle: string;
  // Données supplémentaires pour l'UI enrichie
  volume?: number;
  liquidity?: number;
  endDate?: string;
  spread?: number;
  eventImage?: string;
}

export interface BuyModalState extends BuyModalParams {
  isOpen: boolean;
}

export interface BuilderSignResponse {
  POLY_BUILDER_SIGNATURE: string;
  POLY_BUILDER_TIMESTAMP: string;
  POLY_BUILDER_API_KEY: string;
  POLY_BUILDER_PASSPHRASE: string;
}

export interface ApprovalTransaction {
  to: string;
  data: string;
  value: string;
  operation: OperationType;
}

export interface ApprovalStatus {
  allApproved: boolean;
  usdcApprovals: Record<string, boolean>;
  ctfApprovals: Record<string, boolean>;
}
