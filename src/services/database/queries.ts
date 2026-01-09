// Database query services
import { supabase, sportsDataClient } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export const userQueries = {
  getProfile: async (userId: string) => {
    return await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
  },
  
  getUserStats: async (userId: string) => {
    logger.warn('User stats not implemented - table not created');
    return { data: null, error: null };
  }
};

// Game queries - stub implementation
export const gameQueries = {
  getActiveSessions: async () => {
    logger.warn('Game sessions not implemented - table not created');
    return { data: [], error: null };
  }
};

// Tipster queries using main supabase client
export const tipsterQueries = {
  // Get user's tipster profile
  getTipsterProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('tipster_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    // Convert sport_1_id, sport_2_id, sport_3_id to specialties array
    if (data) {
      const specialties = [data.sport_1_id, data.sport_2_id, data.sport_3_id].filter(Boolean);
      (data as any).specialties = specialties;
      
      // Fetch sport names if any specialties exist
      if (specialties.length > 0) {
        const { data: sports } = await (sportsDataClient as any)
          .from('sport')
          .select('id, name, slug')
          .in('id', specialties);
        
        (data as any).specialty_names = sports || [];
      } else {
        (data as any).specialty_names = [];
      }
    }
    
    return { data, error };
  },

  // Get all active tipsters
  getAllActiveTipsters: async () => {
    const { data, error } = await supabase
      .from('tipster_profiles')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    // Convert sport_1_id, sport_2_id, sport_3_id to specialties array for each profile
    if (data && data.length > 0) {
      data.forEach(profile => {
        const specialties = [profile.sport_1_id, profile.sport_2_id, profile.sport_3_id].filter(Boolean);
        (profile as any).specialties = specialties;
      });
      
      const allSpecialtyIds = data.flatMap(profile => (profile as any).specialties);
      
      if (allSpecialtyIds.length > 0) {
        const { data: sports } = await (sportsDataClient as any)
          .from('sport')
          .select('id, name, slug')
          .in('id', allSpecialtyIds);
        
        // Add specialty names to each profile
        data.forEach(profile => {
          const specialties = (profile as any).specialties;
          if (specialties && specialties.length > 0) {
            (profile as any).specialty_names = specialties.map((specId: string) => 
              sports?.find(sport => sport.id === specId)
            ).filter(Boolean) || [];
          } else {
            (profile as any).specialty_names = [];
          }
        });
      } else {
        data.forEach(profile => {
          (profile as any).specialty_names = [];
        });
      }
    }
    
    return { data, error };
  },

  // Get tipster by ID
  getTipsterById: async (id: string) => {
    const { data, error } = await supabase
      .from('tipster_profiles')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .maybeSingle();
    
    // Convert sport_1_id, sport_2_id, sport_3_id to specialties array
    if (data) {
      const specialties = [data.sport_1_id, data.sport_2_id, data.sport_3_id].filter(Boolean);
      (data as any).specialties = specialties;
      
      // Fetch sport names if any specialties exist
      if (specialties.length > 0) {
        const { data: sports } = await (sportsDataClient as any)
          .from('sport')
          .select('id, name, slug')
          .in('id', specialties);
        
        (data as any).specialty_names = sports || [];
      } else {
        (data as any).specialty_names = [];
      }
    }
    
    return { data, error };
  }
};