import { useEffect, useState, useCallback } from 'react';
import { requestNotificationPermission, onForegroundMessage } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export function useFCM() {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if notifications are supported
    const supported = typeof window !== 'undefined' && 
      'Notification' in window && 
      'serviceWorker' in navigator;
    setIsSupported(supported);
  }, []);

  const enableNotifications = useCallback(async () => {
    if (!isSupported) {
      toast({
        title: "Non supporté",
        description: "Les notifications ne sont pas supportées sur ce navigateur",
        variant: "destructive"
      });
      return null;
    }

    setIsLoading(true);
    try {
      const token = await requestNotificationPermission();
      setFcmToken(token);
      
      if (token) {
        toast({
          title: "Notifications activées",
          description: "Vous recevrez désormais des notifications"
        });
      }
      
      return token;
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'activer les notifications",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, toast]);

  // Listen for foreground messages
  useEffect(() => {
    if (!isSupported) return;

    const unsubscribe = onForegroundMessage((payload) => {
      console.log('Foreground message received:', payload);
      
      toast({
        title: payload.notification?.title || 'Notification',
        description: payload.notification?.body
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isSupported, toast]);

  return { 
    fcmToken, 
    isSupported, 
    isLoading,
    enableNotifications 
  };
}
