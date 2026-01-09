import { useQuery } from '@tanstack/react-query';
import { tipsterQueries } from '@/services/database/queries';
import { useAuth } from '@/hooks/useAuth';
import { cacheConfigs } from '@/lib/queryClient';

export function useTipsterProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['tipster-profile', user?.id],
    queryFn: () => user ? tipsterQueries.getTipsterProfile(user.id) : null,
    enabled: !!user?.id,
    ...cacheConfigs.user,
  });
}

export function useTipsterProfileByUserId(userId: string) {
  return useQuery({
    queryKey: ['tipster-profile-by-id', userId],
    queryFn: () => userId ? tipsterQueries.getTipsterProfile(userId) : null,
    enabled: !!userId,
    ...cacheConfigs.user,
  });
}

export function useHasTipsterProfile(): boolean {
  const { data } = useTipsterProfile();
  return !!(data?.data); // Check if profile exists, not if it's active
}

export function useIsTipsterActive(): boolean {
  const { data } = useTipsterProfile();
  return !!(data?.data?.is_active);
}