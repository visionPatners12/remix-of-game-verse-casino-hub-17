import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PinStatus {
  hasPin: boolean;
  isEnabled: boolean;
  failedAttempts: number;
  isLocked: boolean;
  lockedUntil: string | null;
  lastUsedAt: string | null;
}

export const usePinManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch PIN status
  const {
    data: pinStatus,
    isLoading: isLoadingStatus,
    error
  } = useQuery({
    queryKey: ['pin-status', user?.id],
    queryFn: async (): Promise<PinStatus | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('user_pin')
        .select('pin_enabled, failed_attempts, locked_until, last_used_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('[PIN-MANAGEMENT] Error fetching PIN status:', error);
        throw error;
      }

      if (!data) {
        return {
          hasPin: false,
          isEnabled: false,
          failedAttempts: 0,
          isLocked: false,
          lockedUntil: null,
          lastUsedAt: null
        };
      }

      const isLocked = data.locked_until ? new Date(data.locked_until) > new Date() : false;

      return {
        hasPin: true,
        isEnabled: data.pin_enabled || false,
        failedAttempts: data.failed_attempts || 0,
        isLocked,
        lockedUntil: data.locked_until,
        lastUsedAt: data.last_used_at
      };
    },
    enabled: !!user?.id,
  });

  // Create/Update PIN mutation
  const createPinMutation = useMutation({
    mutationFn: async ({ pin, currentPin }: { pin: string; currentPin?: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Non authentifié');
      }

      const response = await supabase.functions.invoke('pin-verification', {
        body: {
          action: 'set',
          pin,
          current_pin: currentPin
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        console.error('[PIN-MANAGEMENT] Function error:', response.error);
        throw new Error('Erreur lors de l\'appel de la fonction');
      }

      const result = response.data;
      if (!result?.success) {
        throw new Error(result?.message || 'Erreur lors de la configuration du PIN');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pin-status'] });
      toast({
        title: "Succès",
        description: "Code PIN configuré avec succès",
      });
    },
    onError: (error) => {
      console.error('[PIN-MANAGEMENT] Create PIN error:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : 'Erreur lors de la configuration du PIN',
        variant: "destructive",
      });
    },
  });

  // Verify PIN mutation
  const verifyPinMutation = useMutation({
    mutationFn: async (pin: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Non authentifié');
      }

      const response = await supabase.functions.invoke('pin-verification', {
        body: {
          action: 'verify',
          pin
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        console.error('[PIN-MANAGEMENT] Function error:', response.error);
        throw new Error('Erreur lors de l\'appel de la fonction');
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pin-status'] });
    },
    onError: (error) => {
      console.error('[PIN-MANAGEMENT] Verify PIN error:', error);
      queryClient.invalidateQueries({ queryKey: ['pin-status'] });
    },
  });

  // Toggle PIN mutation
  const togglePinMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!user?.id) {
        throw new Error('Utilisateur non authentifié');
      }

      const { error } = await supabase
        .from('user_pin')
        .update({ pin_enabled: enabled })
        .eq('user_id', user.id);

      if (error) {
        console.error('[PIN-MANAGEMENT] Toggle PIN error:', error);
        throw error;
      }

      return { enabled };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pin-status'] });
      toast({
        title: "Succès",
        description: data.enabled ? "Code PIN activé" : "Code PIN désactivé",
      });
    },
    onError: (error) => {
      console.error('[PIN-MANAGEMENT] Toggle PIN error:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : 'Erreur lors de la modification du PIN',
        variant: "destructive",
      });
    },
  });

  // Delete PIN mutation
  const deletePinMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('Utilisateur non authentifié');
      }

      const { error } = await supabase
        .from('user_pin')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('[PIN-MANAGEMENT] Delete PIN error:', error);
        throw error;
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pin-status'] });
      toast({
        title: "Succès",
        description: "Code PIN supprimé avec succès",
      });
    },
    onError: (error) => {
      console.error('[PIN-MANAGEMENT] Delete PIN error:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : 'Erreur lors de la suppression du PIN',
        variant: "destructive",
      });
    },
  });

  // Memoized callback functions
  const createPin = useCallback(async (pin: string) => {
    await createPinMutation.mutateAsync({ pin });
  }, [createPinMutation]);

  const updatePin = useCallback(async (pin: string, currentPin: string) => {
    await createPinMutation.mutateAsync({ pin, currentPin });
  }, [createPinMutation]);

  const verifyPin = useCallback(async (pin: string): Promise<boolean> => {
    try {
      const result = await verifyPinMutation.mutateAsync(pin);
      return result?.valid === true;
    } catch {
      return false;
    }
  }, [verifyPinMutation]);

  const togglePin = useCallback(async (enabled: boolean) => {
    await togglePinMutation.mutateAsync(enabled);
  }, [togglePinMutation]);

  const deletePin = useCallback(async () => {
    await deletePinMutation.mutateAsync();
  }, [deletePinMutation]);

  const isLoading = useMemo(() => 
    isLoadingStatus || 
    createPinMutation.isPending || 
    verifyPinMutation.isPending || 
    togglePinMutation.isPending || 
    deletePinMutation.isPending,
  [isLoadingStatus, createPinMutation.isPending, verifyPinMutation.isPending, togglePinMutation.isPending, deletePinMutation.isPending]);

  return {
    pinStatus,
    isLoading,
    error,
    createPin,
    updatePin,
    verifyPin,
    togglePin,
    deletePin,
    isCreating: createPinMutation.isPending,
    isVerifying: verifyPinMutation.isPending,
    isToggling: togglePinMutation.isPending,
    isDeleting: deletePinMutation.isPending,
  };
};