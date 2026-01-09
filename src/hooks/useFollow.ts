import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useGetStream } from '@/contexts/StreamProvider';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { supabase, socialClient } from '@/integrations/supabase/client';

export function useFollow(targetUserId?: string) {
  const { session } = useAuth();
  const { client, isReady } = useGetStream();
  const [loading, setLoading] = useState(false);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [stats, setStats] = useState({ followers: 0, following: 0 });

  const currentUserId = session?.user?.id;
  
  logger.debug('useFollow - currentUserId:', currentUserId, 'targetUserId:', targetUserId);

  useEffect(() => {
    if (currentUserId && targetUserId && currentUserId !== targetUserId && isReady) {
      checkFollowStatus();
    }
  }, [currentUserId, targetUserId, isReady]);

  useEffect(() => {
    if (targetUserId) {
      loadStats();
    }
  }, [targetUserId]);

  const checkFollowStatus = async () => {
    if (!currentUserId || !targetUserId) return;
    
    try {
      const { data, error } = await socialClient
        .from('user_follows')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
        .maybeSingle();
      
      if (error) throw error;
      setIsFollowingUser(!!data);
    } catch (error) {
      logger.error('Error checking follow status:', error);
      setIsFollowingUser(false);
    }
  };

  const loadStats = async () => {
    if (!targetUserId) return;
    
    try {
      const { data, error } = await socialClient.rpc('get_follow_stats', {
        user_id: targetUserId
      });
      
      if (error) throw error;
      
      // La fonction retourne une TABLE, donc data[0] contient les résultats
      setStats({
        followers: data?.[0]?.followers || 0,
        following: data?.[0]?.following || 0
      });
    } catch (error) {
      logger.error('Error loading follow stats:', error);
      setStats({ followers: 0, following: 0 });
    }
  };

  const handleFollow = async () => {
    if (!currentUserId || !targetUserId || loading || !client) return;

    setLoading(true);
    try {
      const timelineFeed = client.feed('timeline', currentUserId);
      
      if (isFollowingUser) {
        // ÉTAPE 1 : Unfollow sur GetStream
        await timelineFeed.unfollow('user', targetUserId);
        
        // ÉTAPE 2 : Supprimer de Supabase
        const { error } = await socialClient
          .from('user_follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', targetUserId);
        
        if (error) throw error;
        
        setIsFollowingUser(false);
        toast.success('Utilisateur non suivi');
      } else {
        // ÉTAPE 1 : Follow sur GetStream
        await timelineFeed.follow('user', targetUserId, {
          limit: 10,
        });
        
        // ÉTAPE 2 : Insérer dans Supabase
        const { error } = await socialClient
          .from('user_follows')
          .insert({
            follower_id: currentUserId,
            following_id: targetUserId
          });
        
        if (error) throw error;
        
        setIsFollowingUser(true);
        toast.success('Utilisateur suivi');
      }
      
      await loadStats();
      
    } catch (error) {
      logger.error('Error following/unfollowing user:', error);
      toast.error('Erreur lors de l\'action');
      await checkFollowStatus();
      await loadStats();
    } finally {
      setLoading(false);
    }
  };

  return {
    followUser: handleFollow,
    isFollowing: isFollowingUser,
    stats,
    loading,
  };
}