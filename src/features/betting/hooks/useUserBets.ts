import { useQuery } from '@tanstack/react-query';
import { BetService } from '../services/betService';

export function useUserBets(userId: string, limit = 50) {
  return useQuery({
    queryKey: ['user-bets', userId, limit],
    queryFn: () => BetService.getPublicUserBets(userId, limit),
    select: (response) => response.data,
    enabled: !!userId,
    staleTime: 30000, // 30 seconds
  });
}
