import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PlayerData {
  id: string;
  user_id: string;
  color: string;
  position: number;
  is_ready: boolean;
  turn_order: number;
  is_connected: boolean;
  last_seen_at: string;
}

interface PlayerWithUsername extends PlayerData {
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

export const usePlayersWithUsernames = (players: PlayerData[]) => {
  const [playersWithUsernames, setPlayersWithUsernames] = useState<PlayerWithUsername[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsernames = async () => {
      if (players.length === 0) {
        setPlayersWithUsernames([]);
        return;
      }

      setLoading(true);
      try {
        const userIds = players.map(p => p.user_id);
        
        const { data: users, error } = await supabase
          .from('users')
          .select('id, username, first_name, last_name, avatar_url')
          .in('id', userIds);

        if (error) {
          console.error('Error fetching usernames:', error);
          setPlayersWithUsernames(players.map(p => ({ ...p, username: null, first_name: null, last_name: null, avatar_url: null })));
          return;
        }

        const usersMap = new Map(users?.map(u => [u.id, u]) || []);
        
        const enrichedPlayers = players.map(player => {
          const user = usersMap.get(player.user_id);
          return {
            ...player,
            username: user?.username || null,
            first_name: user?.first_name || null,
            last_name: user?.last_name || null,
            avatar_url: user?.avatar_url || null,
          };
        });

        setPlayersWithUsernames(enrichedPlayers);
      } catch (error) {
        console.error('Error in fetchUsernames:', error);
        setPlayersWithUsernames(players.map(p => ({ ...p, username: null, first_name: null, last_name: null, avatar_url: null })));
      } finally {
        setLoading(false);
      }
    };

    fetchUsernames();
  }, [players]);

  return { playersWithUsernames, loading };
};