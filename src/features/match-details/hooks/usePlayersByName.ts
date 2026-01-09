import { useQuery } from '@tanstack/react-query';
import { sportsDataClient } from '@/integrations/supabase/sports-data-client';

interface PlayerMatch {
  id: string;
  full_name: string;
  name: string | null;
  logo: string | null;
}

/**
 * Hook to lookup players by name for navigation in boxscores
 * Returns a map of player names to their UUIDs
 */
export function usePlayersByName(names: string[], sportSlug?: string) {
  return useQuery({
    queryKey: ['players-by-name', names.sort().join(','), sportSlug],
    queryFn: async (): Promise<Map<string, string>> => {
      if (names.length === 0) return new Map();

      // Normalize names for matching
      const normalizedNames = names.map(n => n.toLowerCase().trim());
      
      // Query players table with ilike matching
      const { data, error } = await sportsDataClient
        .from('players')
        .select('id, full_name, name')
        .or(normalizedNames.map(n => `full_name.ilike.%${n}%`).join(','));

      if (error || !data) {
        console.error('[usePlayersByName] Error:', error);
        return new Map();
      }

      // Create a map of normalized name to UUID
      const playerMap = new Map<string, string>();
      
      data.forEach((player: PlayerMatch) => {
        const fullNameLower = player.full_name?.toLowerCase() || '';
        const nameLower = player.name?.toLowerCase() || '';
        
        // Find matching input name
        for (const inputName of names) {
          const inputLower = inputName.toLowerCase().trim();
          
          // Exact match on full_name or name
          if (fullNameLower === inputLower || nameLower === inputLower) {
            playerMap.set(inputName, player.id);
            break;
          }
          
          // Check if input name is contained in full_name (for partial matches)
          if (fullNameLower.includes(inputLower) || inputLower.includes(fullNameLower)) {
            // Only set if not already matched (prefer exact matches)
            if (!playerMap.has(inputName)) {
              playerMap.set(inputName, player.id);
            }
          }
        }
      });

      return playerMap;
    },
    enabled: names.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to lookup players by provider_id for football events
 * Returns a map of providerId to UUID
 */
export function usePlayersByProviderId(providerIds: number[]) {
  return useQuery({
    queryKey: ['players-by-provider-id', providerIds.sort().join(',')],
    queryFn: async (): Promise<Map<number, string>> => {
      if (providerIds.length === 0) return new Map();

      const { data, error } = await sportsDataClient
        .from('players')
        .select('id, provider_id')
        .in('provider_id', providerIds);

      if (error || !data) {
        console.error('[usePlayersByProviderId] Error:', error);
        return new Map();
      }

      const playerMap = new Map<number, string>();
      data.forEach((player: { id: string; provider_id: number }) => {
        if (player.provider_id) {
          playerMap.set(player.provider_id, player.id);
        }
      });

      return playerMap;
    },
    enabled: providerIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}
