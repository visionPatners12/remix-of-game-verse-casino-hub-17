import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { NotificationItem } from '../types';

// Mock data
const mockNotifications: NotificationItem[] = [
  {
    id: '1',
    type: 'follow',
    user: {
      id: '1',
      name: 'Marie Dubois',
      username: 'marie_dub',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5e5?w=150&h=150&fit=crop&crop=face'
    },
    content: 'a commencé à vous suivre',
    time: new Date(Date.now() - 1000 * 60 * 15),
    read: false,
    actionable: true
  },
  {
    id: '2',
    type: 'bet_win',
    user: {
      id: '2',
      name: 'System',
      username: 'system',
    },
    content: 'Félicitations ! Votre pari sur PSG vs OM a été gagnant',
    time: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: false,
    metadata: {
      betAmount: 50,
      winAmount: 125
    }
  },
  {
    id: '3',
    type: 'like',
    user: {
      id: '3',
      name: 'Thomas Martin',
      username: 'tom_martin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    content: 'a aimé votre prédiction',
    time: new Date(Date.now() - 1000 * 60 * 60 * 4),
    read: true
  },
  {
    id: '4',
    type: 'friend_request',
    user: {
      id: '4',
      name: 'Sophie Leroy',
      username: 'sophie_lr',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    },
    content: 'vous a envoyé une demande d\'ami',
    time: new Date(Date.now() - 1000 * 60 * 60 * 6),
    read: false,
    actionable: true
  },
  {
    id: '5',
    type: 'comment',
    user: {
      id: '5',
      name: 'Alex Rousseau',
      username: 'alex_r',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
    },
    content: 'a commenté votre pari: "Excellent choix !"',
    time: new Date(Date.now() - 1000 * 60 * 60 * 8),
    read: true
  },
  {
    id: '6',
    type: 'bet_lose',
    user: {
      id: '2',
      name: 'System',
      username: 'system',
    },
    content: 'Votre pari sur Barcelone vs Real Madrid n\'a pas été gagnant',
    time: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true,
    metadata: {
      betAmount: 25
    }
  },
  {
    id: '7',
    type: 'system',
    content: 'Nouvelle fonctionnalité disponible : Sports !',
    time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    read: true
  }
];

export function useNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        // TODO: Load notifications from API
        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, [user]);

  const markAsRead = async (id: string) => {
    if (!user) return;

    try {
      // TODO: Update notification as read via API
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      // TODO: Mark all notifications as read via API
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );

      toast({
        title: "Notifications mises à jour",
        description: "Toutes les notifications ont été marquées comme lues"
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Erreur",
        description: "Impossible de marquer les notifications comme lues",
        variant: "destructive"
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead
  };
}