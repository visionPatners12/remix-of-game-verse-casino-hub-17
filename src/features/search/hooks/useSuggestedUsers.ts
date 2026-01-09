import { useQuery } from '@tanstack/react-query';
import { socialClient, supabase } from '@/integrations/supabase/client';
import type { SuggestedUser } from '../types';

/**
 * Hook to fetch personalized user suggestions based on:
 * - Users who follow you (but you don't follow back)
 * - Users with shared interests (follow same people)
 * - Users with shared entity preferences (sports, leagues, teams)
 * 
 * Results are scored and sorted by relevance + follower count
 */
export function useSuggestedUsers(limit: number = 5) {
  return useQuery({
    queryKey: ['suggested-users', limit],
    queryFn: async (): Promise<SuggestedUser[]> => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await socialClient.rpc('get_suggested_users', {
        p_user_id: user.id,
        p_limit: limit
      });
      
      if (error) {
        console.error('Failed to fetch suggested users:', error);
        return [];
      }
      
      return (data || []).map((row: any) => ({
        id: row.id,
        username: row.username || 'user',
        name: [row.first_name, row.last_name].filter(Boolean).join(' ') || row.username || 'User',
        avatar: row.avatar_url || '',
        followers: Number(row.followers_count) || 0,
        verified: false,
        bio: row.bio,
        reason: row.reason as SuggestedUser['reason']
      }));
    },
    staleTime: 1000 * 60 * 30, // 30 minutes cache - suggestions don't need to be real-time
    gcTime: 1000 * 60 * 60, // 1 hour garbage collection
    refetchOnWindowFocus: false,
  });
}
