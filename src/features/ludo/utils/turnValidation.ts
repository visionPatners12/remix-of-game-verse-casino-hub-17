import { logger } from '@/utils/logger';

export interface TurnValidationResult {
  isValid: boolean;
  reason: string;
  canRetry: boolean;
}

export interface TurnValidationParams {
  currentPlayerColor?: string;
  gameDataTurn?: string;
  isGameActive?: boolean;
  diceValue?: number | null;
  waitingForMove?: boolean;
}

/**
 * Centralized turn validation with fallback logic and detailed logging
 * Handles race conditions and temporary desynchronization gracefully
 */
export const validatePlayerTurn = (params: TurnValidationParams): TurnValidationResult => {
  const { currentPlayerColor, gameDataTurn, isGameActive, diceValue, waitingForMove } = params;
  
  // Log current state for debugging
  logger.debug('🔍 Turn validation check:', {
    currentPlayerColor,
    gameDataTurn,
    isGameActive,
    diceValue,
    waitingForMove,
    timestamp: new Date().toISOString()
  });

  // Basic checks first
  if (!isGameActive) {
    return {
      isValid: false,
      reason: 'Game is not active',
      canRetry: false
    };
  }

  if (!currentPlayerColor) {
    return {
      isValid: false,
      reason: 'Player color not available',
      canRetry: true
    };
  }

  if (!gameDataTurn) {
    return {
      isValid: false,
      reason: 'Game turn data not available',
      canRetry: true
    };
  }

  // Primary validation: direct comparison
  const isPrimaryMatch = currentPlayerColor === gameDataTurn;
  
  if (isPrimaryMatch) {
    logger.debug('✅ Turn validation passed (primary check)');
    return {
      isValid: true,
      reason: 'Primary validation successful',
      canRetry: false
    };
  }

  // Fallback validation: check if this might be a temporary sync issue
  const couldBeDesync = currentPlayerColor && gameDataTurn && 
                        ['R', 'G', 'Y', 'B'].includes(currentPlayerColor) &&
                        ['R', 'G', 'Y', 'B'].includes(gameDataTurn);

  if (couldBeDesync) {
    logger.warn('⚠️ Turn validation failed - possible desync:', {
      expected: gameDataTurn,
      actual: currentPlayerColor,
      suggestion: 'This might be a temporary synchronization issue'
    });
    
    return {
      isValid: false,
      reason: `Turn mismatch: expected ${gameDataTurn}, got ${currentPlayerColor}`,
      canRetry: true
    };
  }

  logger.error('❌ Turn validation failed - invalid state:', params);
  return {
    isValid: false,
    reason: 'Invalid game state',
    canRetry: false
  };
};

/**
 * Enhanced turn validation with retry logic for actions
 */
export const validateTurnWithRetry = async (
  params: TurnValidationParams,
  maxRetries: number = 2,
  retryDelay: number = 500
): Promise<TurnValidationResult> => {
  let attempt = 0;
  
  while (attempt <= maxRetries) {
    const result = validatePlayerTurn(params);
    
    if (result.isValid || !result.canRetry) {
      return result;
    }
    
    if (attempt < maxRetries) {
      logger.debug(`🔄 Retrying turn validation (attempt ${attempt + 1}/${maxRetries + 1})`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
    
    attempt++;
  }
  
  logger.error('💥 Turn validation failed after all retries');
  return {
    isValid: false,
    reason: 'Validation failed after retries - possible persistent desync',
    canRetry: false
  };
};

/**
 * Simple check for immediate UI updates
 */
export const isPlayerTurnSimple = (currentPlayerColor?: string, gameDataTurn?: string): boolean => {
  return currentPlayerColor === gameDataTurn;
};

/**
 * Enhanced check with fallback for user interactions
 */
export const canPlayerAct = (params: TurnValidationParams): boolean => {
  const result = validatePlayerTurn(params);
  
  // Allow action if validation passes OR if it's a potentially recoverable sync issue
  return result.isValid || (result.canRetry && params.currentPlayerColor === params.gameDataTurn);
};