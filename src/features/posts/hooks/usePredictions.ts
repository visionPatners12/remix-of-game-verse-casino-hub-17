import { useQuery } from '@tanstack/react-query';
import { PredictionService } from '../services/PredictionService';

export function usePredictions(limit = 20) {
  return useQuery({
    queryKey: ['predictions', 'public', limit],
    queryFn: () => PredictionService.getPublicPredictions(limit),
    staleTime: 30000, // 30 secondes
    refetchOnWindowFocus: false
  });
}

export function useUserPredictions(userId: string, limit = 50) {
  return useQuery({
    queryKey: ['predictions', 'user', userId, limit],
    queryFn: () => PredictionService.getUserPredictions(userId, limit),
    enabled: !!userId,
    staleTime: 30000
  });
}
