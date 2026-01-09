/**
 * Centralized API service for Ludo game operations
 * All Supabase edge function calls go through this service
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import type {
  RollResponse,
  MoveResponse,
  SkipResponse,
  AutoPlayResponse,
  StartResponse,
  ExitResponse,
} from '../types';

/**
 * Ludo API service - centralized edge function calls
 */
export const ludoApi = {
  /**
   * Roll the dice for the current player
   */
  roll: async (gameId: string): Promise<RollResponse> => {
    logger.debug('🎲 API: Rolling dice', { gameId });
    
    const { data, error } = await supabase.functions.invoke('ludo-game', {
      body: { action: 'roll', gameId }
    });

    if (error) {
      logger.error('❌ API: Roll failed', error);
      throw error;
    }

    logger.debug('✅ API: Roll response', data);
    return data as RollResponse;
  },

  /**
   * Move a pawn for the current player
   */
  move: async (gameId: string, pawnIndex: number): Promise<MoveResponse> => {
    logger.debug('🚶 API: Moving pawn', { gameId, pawnIndex });
    
    const { data, error } = await supabase.functions.invoke('ludo-game', {
      body: { action: 'move', gameId, pawnIndex }
    });

    if (error) {
      logger.error('❌ API: Move failed', error);
      throw error;
    }

    logger.debug('✅ API: Move response', data);
    return data as MoveResponse;
  },

  /**
   * Skip the current player's turn (when no valid moves)
   */
  skip: async (gameId: string): Promise<SkipResponse> => {
    logger.debug('⏭️ API: Skipping turn', { gameId });
    
    const { data, error } = await supabase.functions.invoke('ludo-game', {
      body: { action: 'skip', gameId }
    });

    if (error) {
      logger.error('❌ API: Skip failed', error);
      throw error;
    }

    logger.debug('✅ API: Skip response', data);
    return data as SkipResponse;
  },

  /**
   * Auto-play when timer expires
   */
  autoPlay: async (gameId: string): Promise<AutoPlayResponse> => {
    logger.debug('⏰ API: Auto-playing', { gameId });
    
    const { data, error } = await supabase.functions.invoke('ludo-game', {
      body: { action: 'autoPlay', gameId }
    });

    if (error) {
      logger.error('❌ API: AutoPlay failed', error);
      throw error;
    }

    logger.debug('✅ API: AutoPlay response', data);
    return data as AutoPlayResponse;
  },

  /**
   * Start the game (creator only)
   */
  start: async (gameId: string): Promise<StartResponse> => {
    logger.debug('🎮 API: Starting game', { gameId });
    
    const { data, error } = await supabase.functions.invoke('ludo-game', {
      body: { action: 'start', gameId }
    });

    if (error) {
      logger.error('❌ API: Start failed', error);
      throw error;
    }

    logger.debug('✅ API: Start response', data);
    return data as StartResponse;
  },

  /**
   * Exit/leave the game
   */
  exit: async (gameId: string, userId: string): Promise<ExitResponse> => {
    logger.debug('🚪 API: Exiting game', { gameId, userId });
    
    const { data, error } = await supabase.functions.invoke('ludo-game', {
      body: { action: 'exit', gameId, userId }
    });

    if (error) {
      logger.error('❌ API: Exit failed', error);
      throw error;
    }

    logger.debug('✅ API: Exit response', data);
    return data as ExitResponse;
  },
};

export default ludoApi;
