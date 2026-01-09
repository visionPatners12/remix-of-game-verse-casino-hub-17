import { useQuery } from '@tanstack/react-query';
import { subscriptionQueries } from '@/services/database/subscriptionQueries';
import { useAuth } from '@/hooks/useAuth';
import { cacheConfigs } from '@/lib/queryClient';

export function useSubscription(tipsterId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['subscription', user?.id, tipsterId],
    queryFn: () => user ? subscriptionQueries.checkSubscription(user.id, tipsterId) : null,
    enabled: !!user?.id && !!tipsterId,
    ...cacheConfigs.user,
  });
}

export function useSubscriptionStatus(tipsterId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['subscription-status', user?.id, tipsterId],
    queryFn: () => user ? subscriptionQueries.getSubscriptionStatus(user.id, tipsterId) : null,
    enabled: !!user?.id && !!tipsterId,
    ...cacheConfigs.user,
  });
}

export function useTipsterWalletAddress(tipsterId: string) {
  return useQuery({
    queryKey: ['tipster-wallet', tipsterId],
    queryFn: () => subscriptionQueries.getTipsterWalletAddress(tipsterId),
    enabled: !!tipsterId,
    ...cacheConfigs.user,
  });
}

export function useUserSubscriptions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-subscriptions', user?.id],
    queryFn: () => user ? subscriptionQueries.getUserSubscriptions(user.id) : null,
    enabled: !!user?.id,
    ...cacheConfigs.user,
  });
}