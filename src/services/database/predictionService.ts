import { logger } from '@/utils/logger';

export interface PredictionData {
  match_id: string;
  condition_id: string;
  outcome_id: string;
  prediction_type: 'tip' | 'classic' | 'bet';
  hashtags?: string[];
  visibility?: 'public' | 'private';
  bet_amount?: number;
  currency?: 'USDT';
}

export interface Prediction {
  id: string;
  user_id: string;
  match_id: string;
  condition_id: string;
  outcome_id: string;
  prediction_type: 'tip' | 'classic' | 'bet';
  hashtags: string[];
  visibility: 'public' | 'private';
  is_won: boolean | null;
  bet_amount?: number;
  currency?: 'USDT';
  created_at: string;
  updated_at: string;
}

// Mock prediction service since predictions table doesn't exist
export const savePrediction = async (data: PredictionData): Promise<{ error: any; data?: Prediction }> => {
  logger.warn('Predictions functionality disabled - table not found');
  return { 
    error: { message: 'Predictions functionality temporarily disabled' },
    data: undefined 
  };
};

// Mock get user predictions
export const getUserPredictions = async (limit = 50): Promise<{ error: any; data?: Prediction[] }> => {
  logger.warn('Predictions functionality disabled - table not found');
  return { 
    error: null,
    data: [] 
  };
};

// Mock update prediction result
export const updatePredictionResult = async (id: string, isWon: boolean): Promise<{ error: any }> => {
  logger.warn('Predictions functionality disabled - table not found');
  return { 
    error: { message: 'Predictions functionality temporarily disabled' }
  };
};

// Mock save bet prediction
export const saveBetPrediction = async (data: PredictionData & { bet_amount: number; currency: 'USDT' }): Promise<{ error: any; data?: Prediction }> => {
  return savePrediction({
    ...data,
    prediction_type: 'bet'
  });
};