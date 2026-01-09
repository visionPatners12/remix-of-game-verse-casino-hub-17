// Simple types to replace critical 'any' usage
// KISS: Use specific types instead of 'any' everywhere

import type { User, Session } from '@supabase/supabase-js';
import type { Game } from '@azuro-org/toolkit';

// Auth types
export interface SimpleUser extends User {}
export interface SimpleSession extends Session {}

export interface AuthContextType {
  user: SimpleUser | null;
  session: SimpleSession | null;
  isLoading: boolean;
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export interface SignUpData {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  phoneVerified: boolean;
  xbox_gamertag?: string;
  psn_username?: string;
  epic_username?: string;
  activision_username?: string;
}

// Simple wallet types - no 'any'
export interface SimpleWalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
  networkName: string | null;
}


export interface SimpleWalletUser {
  id: string;
  email: string;
  username?: string;
}

// Post types - no 'any'
export interface SimplePost {
  id: string;
  type: 'video' | 'opinion' | 'highlight' | 'photo';
  author: {
    username: string;
    fullName: string;
    avatar?: string;
  };
  timestamp: string;
  tags: string[];
  comments: SimpleComment[];
  content: VideoContent | OpinionContent | HighlightContent | PhotoContent;
}

export interface SimpleComment {
  id: string;
  text: string;
  author: string;
  timestamp: string;
}

export interface VideoContent {
  videoId: string;
  title: string;
  description: string;
}

export interface OpinionContent {
  opinion: string;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down';
}

export interface HighlightContent {
  caption: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  autoplay?: boolean;
}

export interface PhotoContent {
  imageUrl: string;
  caption: string;
}

// Stream types - no 'any'
export interface SimpleStreamClient {
  id: string;
  disconnect: () => Promise<void>;
}

export interface SimpleChatClient {
  id: string;
  sendMessage: (message: string) => Promise<void>;
}

// Error types
export interface SimpleError {
  message: string;
  code?: string;
}

export type SimpleErrorHandler = (error: SimpleError) => void;

// Network/chain mapping
export const CHAIN_NAMES: Record<number, string> = {
  1: 'ethereum',
  137: 'polygon',
  56: 'binance-smart-chain',
  43114: 'avalanche',
  250: 'fantom',
  42161: 'arbitrum',
  10: 'optimism',
};

export const getChainName = (chainId: number): string => {
  return CHAIN_NAMES[chainId] || 'unknown';
};

// SDK Types - No more 'any' but keep flexibility for GraphQL fragments
export type GameData = Record<string, unknown> & {
  id: string;
  gameId: string;
  scores?: {
    localteam_score?: number;
    visitorteam_score?: number;
    [key: string]: unknown;
  };
};
export type ParticipantData = { name: string; image?: string | null; };
export type TeamData = { name: string; slug: string; image?: string; image_path?: string; };
export type JsonRpcParams = unknown[];
export type TransactionData = { from?: string; to?: string; value?: string; data?: string; gas?: string; gasLimit?: string; };
export type ProviderRequest = { method: string; params?: JsonRpcParams; };

// Filter types
export interface GameFilter {
  limit: number;
  sportSlug?: string;
  leagueSlug?: string;
}

// Chat client type
export interface ChatClientLike {
  id: string;
  [key: string]: unknown;
}