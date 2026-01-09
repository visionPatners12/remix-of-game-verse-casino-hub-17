import { supabase } from "@/integrations/supabase/client";

export interface DeploySplitParams {
  monthly_price: string;
  description: string;
  experience?: string;
  specialties?: string[];
}

export interface TipsterProfileResponse {
  id: string;
  user_id: string;
  monthly_price: number;
  description: string;
  experience: string | null;
  is_active: boolean;
  split_contract_address: string;
  split_queue_id: string;
  sport_1_id: string | null;
  sport_2_id: string | null;
  sport_3_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeploySplitResponse {
  success: boolean;
  tipster_profile: TipsterProfileResponse;
  split: {
    contractAddress: string;
    queueId: string;
    chain: number;
  };
}

export async function deployTipsterSplitContract(
  params: DeploySplitParams
): Promise<DeploySplitResponse> {
  const { data, error } = await supabase.functions.invoke('deploy-split', {
    body: params,
  });

  if (error) {
    console.error('❌ Edge function error:', error);
    
    if (error.message?.includes('already exists')) {
      throw new Error('Vous avez déjà un profil tipster actif.');
    }
    
    throw new Error(error.message || 'Erreur lors de la création du profil');
  }

  if (!data?.success) {
    console.error('❌ Deployment failed:', data);
    
    if (data?.error?.includes('already exists')) {
      throw new Error('Vous avez déjà un profil tipster actif.');
    }
    
    throw new Error(data?.error || 'Échec de la création du profil tipster');
  }
  
  return data;
}
