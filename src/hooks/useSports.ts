import { useQuery } from '@tanstack/react-query';
import { sportsDataClient } from '@/integrations/supabase/client';
import { Trophy } from 'lucide-react';
import { getSportIcon, Sport } from '@/lib/sportIconsLite';

export type { Sport };

export const useSports = () => {
  return useQuery({
    queryKey: ['sports'],
    queryFn: async (): Promise<Sport[]> => {
      const { data, error } = await sportsDataClient
        .from('sport')
        .select('id, name, icon_name, slug')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching sports:', error);
        throw error;
      }

      // Convert to Sport format with mapped icons
      return (data || []).map(sport => ({
        id: sport.id,
        name: sport.name,
        icon_name: sport.icon_name || '',
        slug: sport.slug || '',
        icon: getSportIcon(sport.icon_name)
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
};
