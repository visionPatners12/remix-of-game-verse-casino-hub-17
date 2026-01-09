import { sportsDataClient } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface SportRecord {
  id: string;
  azuro_id: number;
  name: string;
  slug: string;
  icon_name: string;
  category: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Service pour récupérer les sports depuis la base de données
 */
export const sportsService = {
  /**
   * Récupère tous les sports triés par ordre d'affichage
   */
  async getAllSports(): Promise<SportRecord[]> {
    const { data, error } = await sportsDataClient
      .schema('sports_data')
      .from('sport')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      logger.error('Error fetching sports:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Récupère un sport par son ID Azuro
   */
  async getSportByAzuroId(azuroId: number): Promise<SportRecord | null> {
    const { data, error } = await sportsDataClient
      .schema('sports_data')
      .from('sport')
      .select('*')
      .eq('azuro_id', azuroId)
      .maybeSingle();

    if (error) {
      logger.error('Error fetching sport by azuro_id:', error);
      throw error;
    }

    return data;
  },

  /**
   * Récupère un sport par son slug
   */
  async getSportBySlug(slug: string): Promise<SportRecord | null> {
    const { data, error } = await sportsDataClient
      .schema('sports_data')
      .from('sport')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      logger.error('Error fetching sport by slug:', error);
      throw error;
    }

    return data;
  },

  /**
   * Récupère les sports par catégorie
   */
  async getSportsByCategory(category: string): Promise<SportRecord[]> {
    const { data, error } = await sportsDataClient
      .schema('sports_data')
      .from('sport')
      .select('*')
      .eq('category', category as any)
      .order('display_order', { ascending: true });

    if (error) {
      logger.error('Error fetching sports by category:', error);
      throw error;
    }

    return data || [];
  }
};