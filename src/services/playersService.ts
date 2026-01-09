import { sportsDataClient } from '@/integrations/supabase/sports-data-client';
import { logger } from '@/utils/logger';

interface Player {
  id: number;
  full_name: string;
  logo: string | null;
  profile: any;
}

/**
 * Fetch players from sports_data.players table
 * @param teamId - The team ID to filter players
 * @returns Promise with players data
 */
export async function getTeamPlayers(teamId: string): Promise<Player[]> {
  try {
    const { data, error } = await sportsDataClient
      .from('players')
      .select('id, full_name, logo, profile')
      .eq('team', teamId)
      .limit(50);

    if (error) {
      logger.error('Error fetching players:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    logger.error('Error in getTeamPlayers:', error);
    return [];
  }
}

/**
 * Parse player profile data to extract position, age, number, etc.
 */
export function parsePlayerProfile(profile: any) {
  if (!profile) return null;
  
  return {
    position: profile.position?.main || 'Unknown',
    age: 0, // Age not available in this data structure
    number: profile.jersey || null,
    nationality: profile.birthPlace || '',
    photo: profile.team?.logo || null,
    height: profile.height || null,
    weight: profile.weight || null,
    isActive: profile.isActive || false,
  };
}
