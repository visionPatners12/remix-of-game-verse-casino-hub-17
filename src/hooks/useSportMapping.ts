import { useQuery } from '@tanstack/react-query';
import { sportsDataClient } from '@/integrations/supabase/client';

export function useSportMapping() {
  return useQuery({
    queryKey: ['sport-azuro-mapping'],
    queryFn: async () => {
      const { data, error } = await sportsDataClient
        .from('sport')
        .select('id, azuro_id');
      
      if (error) throw error;
      
      // Map Azuro ID (string) → UUID
      return new Map<string, string>(
        (data || []).map(s => [String(s.azuro_id), s.id])
      );
    },
    staleTime: Infinity // Sport mapping never changes
  });
}
