import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BetService } from '../services/betService';
import type { CreateBetData, BetFilters } from '../types/bet';
import { useToast } from '@/hooks/use-toast';

export function useBets(filters?: BetFilters) {
  return useQuery({
    queryKey: ['bets', filters],
    queryFn: () => BetService.getUserBets(filters),
    select: (response) => response.data,
  });
}

export function useBet(betId: string) {
  return useQuery({
    queryKey: ['bet', betId],
    queryFn: () => BetService.getBetById(betId),
    select: (response) => response.data,
    enabled: !!betId,
  });
}

export function useCreateBet() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateBetData) => BetService.createBet(data),
    onSuccess: (response) => {
      if (response.data) {
        toast({
          title: "Bet Placed Successfully",
          description: `Bet code: ${response.data.bet_code}`,
        });
        
        // Invalidate and refetch bets
        queryClient.invalidateQueries({ queryKey: ['bets'] });
        queryClient.invalidateQueries({ queryKey: ['betting-stats'] });
      } else if (response.error) {
        toast({
          title: "Failed to Place Bet",
          description: response.error.message || "An error occurred",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to Place Bet",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
}

export function useSharedBets() {
  return useQuery({
    queryKey: ['shared-bets'],
    queryFn: () => BetService.getSharedBets(),
    select: (response) => response.data,
  });
}

export function useBettingStats() {
  return useQuery({
    queryKey: ['betting-stats'],
    queryFn: () => BetService.getUserBettingStats(),
    select: (response) => response.data,
  });
}

export function useUpdateBetStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ betId, status, actualWin }: { 
      betId: string; 
      status: 'won' | 'lost' | 'cancelled' | 'refunded'; 
      actualWin?: number 
    }) => BetService.updateBetStatus(betId, status, actualWin),
    onSuccess: (response) => {
      if (response.data) {
        toast({
          title: "Bet Updated",
          description: `Bet status updated to ${response.data.status}`,
        });
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['bets'] });
        queryClient.invalidateQueries({ queryKey: ['bet', response.data.id] });
        queryClient.invalidateQueries({ queryKey: ['betting-stats'] });
      }
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update bet status",
        variant: "destructive",
      });
    },
  });
}