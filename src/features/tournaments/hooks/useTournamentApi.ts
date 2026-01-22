import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TournamentFormData, PRIZE_DISTRIBUTIONS } from '../types';
import { toast } from 'sonner';

interface Tournament {
  id: string;
  name: string;
  description: string | null;
  bracket_size: number;
  entry_fee: number;
  prize_pool: number;
  status: string;
  registration_start: string;
  registration_end: string;
  tournament_start: string | null;
  created_at: string;
  tournament_participants?: { count: number }[];
}

interface TournamentDetails {
  id: string;
  name: string;
  description: string | null;
  bracket_size: number;
  entry_fee: number;
  prize_pool: number;
  status: string;
  registration_start: string;
  registration_end: string;
  tournament_start: string | null;
  created_at: string;
  tournament_participants: Array<{
    id: string;
    user_id: string;
    status: string;
    final_position: number | null;
    registered_at: string;
  }>;
  tournament_matches: Array<{
    id: string;
    round_number: number;
    match_number: number;
    status: string;
    winner_user_id: string | null;
    ludo_game_id: string | null;
  }>;
}

export function useTournamentApi() {
  const queryClient = useQueryClient();

  // CREATE TOURNAMENT
  const createTournament = useMutation({
    mutationFn: async (formData: TournamentFormData) => {
      const { data, error } = await supabase.functions.invoke('tournament-api', {
        body: {
          action: 'create',
          name: formData.name,
          description: formData.description,
          tournamentSize: formData.tournamentSize,
          entryFee: formData.entryFee,
          commissionRate: formData.commissionRate,
          registrationStart: formData.registrationStart.toISOString(),
          registrationEnd: formData.registrationEnd.toISOString(),
          tournamentStart: formData.tournamentStart?.toISOString() || null,
          startWhenFull: formData.startWhenFull,
          prizeDistributionType: formData.prizeDistributionType,
          prizeDistribution: PRIZE_DISTRIBUTIONS[formData.prizeDistributionType].distribution.map(d => ({
            position: d.position,
            percentage: d.percentage
          }))
        }
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast.success('Tournoi créé avec succès !');
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  // JOIN TOURNAMENT
  const joinTournament = useMutation({
    mutationFn: async (tournamentId: string) => {
      const { data, error } = await supabase.functions.invoke('tournament-api', {
        body: {
          action: 'join',
          tournamentId
        }
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast.success('Inscription réussie !');
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  // START TOURNAMENT
  const startTournament = useMutation({
    mutationFn: async (tournamentId: string) => {
      const { data, error } = await supabase.functions.invoke('tournament-api', {
        body: {
          action: 'start',
          tournamentId
        }
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast.success('Tournoi démarré !');
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  return {
    createTournament,
    joinTournament,
    startTournament
  };
}

// GET TOURNAMENT DETAILS
export function useTournament(tournamentId: string | undefined) {
  return useQuery({
    queryKey: ['tournaments', tournamentId],
    queryFn: async (): Promise<TournamentDetails | null> => {
      if (!tournamentId) return null;
      
      const { data, error } = await supabase.functions.invoke('tournament-api', {
        body: {
          action: 'get',
          tournamentId
        }
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data.tournament;
    },
    enabled: !!tournamentId
  });
}

// LIST TOURNAMENTS
export function useTournaments(status?: string) {
  return useQuery({
    queryKey: ['tournaments', { status }],
    queryFn: async (): Promise<{ tournaments: Tournament[]; total: number }> => {
      const { data, error } = await supabase.functions.invoke('tournament-api', {
        body: {
          action: 'list',
          status,
          limit: 50
        }
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return { tournaments: data.tournaments, total: data.total };
    }
  });
}
