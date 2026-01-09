// ============= UNIFIED TYPES - SINGLE SOURCE OF TRUTH =============
// Essential types only

import { User, Session } from '@supabase/supabase-js';
import type { GamesQuery, Market, MarketOutcome } from '@azuro-org/toolkit';

// ===== AUTH TYPES =====
export interface AuthUser extends User {
  id: string;
  email: string;
  user_metadata: UserMetadata;
}

export interface UserMetadata {
  username?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  country?: string;
  date_of_birth?: string;
  auth_method?: 'email' | 'wallet' | 'privy';
  privy_id?: string; // New: Privy DID for identification
  wallet_address?: string;
  avatar_url?: string;
}

export interface AuthSession extends Session {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
  expires_at?: number;
}

export interface SignUpData {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  dateOfBirth?: Date;
  phoneVerified?: boolean;
  xbox_gamertag?: string;
  psn_username?: string;
  epic_username?: string;
  activision_username?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // User type information (consolidated from hooks)
  userType: 'privy' | 'supabase' | 'none';
  isEmailPasswordUser: boolean;
  isWalletUser: boolean;
  isFullyAuthenticated: boolean;
}

export interface AuthActions {
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (data: SignInData) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export interface AuthContextType extends AuthState, AuthActions {}

// ===== STREAM TYPES =====
export type LiveStreamStatus = 'scheduled' | 'live' | 'ended' | 'cancelled' | 'backstage';

export interface LiveStream {
  call_id: string;
  title?: string;
  description?: string;
  game_id?: string;
  hashtags: string[];
  tags: string[];
  is_public: boolean;
  starts_at?: string;
  created_by?: string;
  status: LiveStreamStatus;
  participant_count: number;
  peak_viewers: number;
  is_live: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateLiveStreamData {
  call_id: string;
  title?: string;
  description?: string;
  game_id?: string;
  hashtags?: string[];
  tags?: string[];
  is_public?: boolean;
  starts_at?: string;
  created_by: string;
}

export interface UpdateLiveStreamData {
  title?: string;
  description?: string;
  game_id?: string;
  hashtags?: string[];
  tags?: string[];
  is_public?: boolean;
  starts_at?: string;
  status?: LiveStreamStatus;
  participant_count?: number;
  peak_viewers?: number;
  is_live?: boolean;
}

// ===== MARKET & PREDICTION TYPES =====
export enum ConditionState {
  Active = 'Active',
  Canceled = 'Canceled',
  Removed = 'Removed',
  Resolved = 'Resolved',
  Stopped = 'Stopped'
}

export interface PredictionSelection {
  matchId: string;
  selectedOutcome: MarketOutcome;
  market: Market;
  prediction: {
    matchTitle: string;
    predictionText: string;
    odds: number;
    sport: string;
    league: string;
  };
  // Native Azuro data (no wrapper object)
  gameId: string;
  conditionId: string;
  outcomeId: string;
  startsAt: string;
  participants: Array<{
    name: string;
    image?: string | null;
  }>;
}

export interface PredictionPreview {
  matchTitle: string;
  predictionText: string;
  odds: number;
  sport: string;
  league: string;
  confidence?: number;
  participants: Array<{
    name: string;
    image?: string | null;
  }>;
  // Native Azuro data
  gameId: string;
  conditionId: string;
  outcomeId: string;
  startsAt: string;
  market: Market;
  selectedOutcome: MarketOutcome;
}

export interface MarketData {
  game: GamesQuery['games'][0] | null;
  markets: Market[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// ===== WALLET TYPES =====
export type UserType = 'privy' | 'supabase' | 'none';

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
  network: string | null;
}

export interface UnifiedWalletHook extends WalletState {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
  isLoading: boolean;
  hasAnyWallet: boolean;
  walletClient: Record<string, unknown>;
}

// ===== TYPE GUARDS =====
export function isAuthenticatedUser(user: User | null): user is AuthUser {
  return user !== null && typeof user.id === 'string' && typeof user.email === 'string';
}

export function isValidSession(session: Session | null): session is AuthSession {
  return session !== null && 
         session.user !== null && 
         isAuthenticatedUser(session.user) &&
         typeof session.access_token === 'string';
}

// ===== TIP TYPES =====
export * from './types/tip';