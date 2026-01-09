import { supabase } from '@/integrations/supabase/client';
import { savePrediction, type PredictionData } from './predictionService';

// Tipster mutations using main supabase client
export const tipsterMutations = {
  // Create tipster profile
  createTipsterProfile: async (data: {
    user_id: string;
    monthly_price: number;
    description: string;
    specialties?: string[];
    experience?: string;
  }) => {
    const { error } = await supabase
      .from('tipster_profiles')
      .insert(data);
    return { error };
  },

  // Update tipster profile
  updateTipsterProfile: async (userId: string, data: {
    monthly_price?: number;
    description?: string;
    specialties?: string[];
    experience?: string;
  }) => {
    const { error } = await supabase
      .from('tipster_profiles')
      .update(data)
      .eq('user_id', userId);
    return { error };
  },

  // Toggle tipster status
  toggleTipsterStatus: async (userId: string, isActive: boolean) => {
    const { error } = await supabase
      .from('tipster_profiles')
      .update({ is_active: isActive })
      .eq('user_id', userId);
    return { error };
  },

  // Update tipster split contract address
  updateTipsterSplitContract: async (userId: string, splitContractAddress: string) => {
    const { error } = await supabase
      .from('tipster_profiles')
      .update({ split_contract_address: splitContractAddress } as any)
      .eq('user_id', userId);
    return { error };
  }
};

// Prediction mutations
export const predictionMutations = {
  // Save a prediction
  savePrediction: async (data: PredictionData) => {
    return await savePrediction(data);
  }
};