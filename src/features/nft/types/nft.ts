export interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

// Bet NFT specific types
export interface BetLeg {
  market_type: string;
  pick: string;
  odds: number;
  starts_at: string;
  league_name: string;
  home_team_name: string;
  away_team_name: string;
}

export interface BetDetails {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  potential_win: number;
  total_odds: number;
  bet_type: 'single' | 'combo' | 'system';
  is_won: boolean;
  settled_at: string;
  created_at: string;
  nft_token_id?: string | null;
  nft_contract_address?: string | null;
}

export interface NFT {
  id: string;
  name: string;
  collection: string;
  image: string;
  price: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  status: 'available' | 'sold' | 'auction' | 'owned';
  tokenId: string;
  description: string;
  attributes: NFTAttribute[];
  createdAt: string;
}

// ThirdWeb API Types
export interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  image_url?: string;
  metadata_url?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  [key: string]: any;
}

export interface ThirdWebNFT {
  chain_id: number;
  token_address: string;
  token_id: string;
  balance: string;
  name: string;
  description: string;
  image_url: string | null;
  video_url: string | null;
  animation_url: string | null;
  background_color?: string;
  external_url?: string;
  status?: string;
  metadata_url: string;
  owner_addresses?: string[];
  extra_metadata: {
    image_url?: string;
    attributes?: Array<{
      trait_type: string;
      value: string | number;
    }>;
    properties?: {
      bet?: BetDetails;
      legs?: BetLeg[];
    };
    image_original_url?: string;
    [key: string]: any;
  };
  collection?: {
    name?: string;
    description?: string;
    image_url?: string;
    banner_image_url?: string;
    featured_image_url?: string;
    external_link?: string;
  };
  contract?: {
    chain_id: number;
    address: string;
    name?: string;
    symbol?: string;
    type: string;
  };
}

export interface ThirdWebNFTsResponse {
  data: ThirdWebNFT[];
  hasNextPage: boolean;
  nextPageCursor?: string;
}

// Mint Parameters
export interface MintNFTParams {
  name?: string;
  description?: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
}