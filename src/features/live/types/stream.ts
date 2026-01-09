import type { GamesQuery } from '@azuro-org/toolkit';

export type AzuroGame = GamesQuery['games'][0];

export interface TeamInfo {
  name: string;
  slug?: string;
  image?: string;
  image_path?: string;
}

export type StreamStatus = 'created' | 'live' | 'ended';

export interface StreamData {
  id: string;
  user_id: string;
  match_id?: string;
  title: string;
  description?: string;
  hashtags: string[];
  visibility: boolean;
  viewers_count: number;
  status: StreamStatus;
  created_at: string;
  updated_at: string;
}

export interface StreamCreationData {
  title: string;
  description: string;
  isPublic: boolean;
  gameId?: string;
  hashtags: string[];
  tags: string[];
}

export interface StreamState {
  isLoading: boolean;
  error: string | null;
  callId?: string;
}

export interface StreamHostState {
  isConnected: boolean;
  isStreaming: boolean;
  isCameraOn: boolean;
  isMicOn: boolean;
  participantCount: number;
}

export interface StreamViewerState {
  isConnected: boolean;
  streamQuality: 'auto' | 'high' | 'medium' | 'low';
  isFullscreen: boolean;
  volume: number;
}