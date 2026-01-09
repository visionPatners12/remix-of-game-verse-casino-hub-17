import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useFCM } from '@/hooks/useFCM';
import { supabase } from '@/integrations/supabase/client';
import { fcmService } from '../services/fcmService';
import { NotificationSettings } from '../types';

const defaultNotifications: NotificationSettings = {
  email: true,
  push: false,
  marketing: false,
  security: true,
  tips: true
};

export function useNotificationSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { enableNotifications, fcmToken, isSupported } = useFCM();
  
  const [notifications, setNotifications] = useState<NotificationSettings>(defaultNotifications);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const { data } = await supabase
          .from('users')
          .select('push_enabled, email_enabled')
          .eq('id', user.id)
          .single();

        if (data) {
          setNotifications(prev => ({
            ...prev,
            push: data.push_enabled ?? false,
            email: data.email_enabled ?? true
          }));
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, [user?.id]);

  const updateNotifications = async (updates: Partial<NotificationSettings>) => {
    if (!user?.id) {
      toast({
        title: "Non connecté",
        description: "Vous devez être connecté pour modifier vos préférences",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUpdating(true);

      // Handle push notifications toggle
      if (updates.push === true) {
        if (!isSupported) {
          toast({
            title: "Non supporté",
            description: "Les notifications push ne sont pas supportées sur ce navigateur",
            variant: "destructive"
          });
          return;
        }

        const token = await enableNotifications();
        
        if (token) {
          await fcmService.saveToken(token);
          await supabase
            .from('users')
            .update({ push_enabled: true })
            .eq('id', user.id);
        } else {
          toast({
            title: "Permission refusée",
            description: "Vous avez refusé les notifications push",
            variant: "destructive"
          });
          return;
        }
      }

      if (updates.push === false) {
        if (fcmToken) {
          await fcmService.deactivateToken(fcmToken);
        } else {
          await fcmService.deactivateAllTokens();
        }
        await supabase
          .from('users')
          .update({ push_enabled: false })
          .eq('id', user.id);
      }

      // Handle email notifications toggle
      if (updates.email !== undefined) {
        await supabase
          .from('users')
          .update({ email_enabled: updates.email })
          .eq('id', user.id);
      }

      setNotifications(prev => ({ ...prev, ...updates }));

      toast({
        title: "Notifications mises à jour",
        description: "Vos préférences de notification ont été sauvegardées"
      });
    } catch (error: any) {
      console.error('Error updating notifications:', error);
      
      const isAuthError = error?.message?.includes('Not authenticated') || error?.code === '403';
      
      toast({
        title: isAuthError ? "Session expirée" : "Erreur",
        description: isAuthError 
          ? "Veuillez vous reconnecter pour modifier vos préférences" 
          : "Impossible de sauvegarder les préférences",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    notifications,
    isLoading,
    isUpdating,
    updateNotifications,
    isNotificationSupported: isSupported
  };
}
