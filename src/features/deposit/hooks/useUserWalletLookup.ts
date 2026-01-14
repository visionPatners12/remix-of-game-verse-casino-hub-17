import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SearchedUser {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  ens_subdomain: string | null;
  wallet_address: string | null;
}

export const useUserWalletLookup = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchedUser[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  const searchUsers = useCallback(async (query: string): Promise<SearchedUser[]> => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return [];
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const { data, error } = await supabase.rpc('search_users_safe', {
        search_term: query,
        limit_count: 10
      });

      if (error) throw error;

      // For each user, fetch their ENS subdomain and wallet_address from users table
      const usersWithWallets = await Promise.all(
        (data || []).map(async (user: any) => {
          const { data: userData } = await supabase
            .from('users')
            .select('ens_subdomain, wallet_address')
            .eq('id', user.id)
            .single();

          return {
            id: user.id,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            avatar_url: user.avatar_url,
            ens_subdomain: userData?.ens_subdomain || null,
            wallet_address: userData?.wallet_address || null
          };
        })
      );

      setSearchResults(usersWithWallets);
      return usersWithWallets;
    } catch (error) {
      console.error('User search error:', error);
      setSearchError('Failed to search users');
      setSearchResults([]);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, []);

  const lookupUserWallet = useCallback(async (userId: string): Promise<SearchedUser | null> => {
    try {
      // Fetch user details including wallet_address directly from users table
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, username, first_name, last_name, avatar_url, ens_subdomain, wallet_address')
        .eq('id', userId)
        .single();

      if (userError || !user) return null;

      return user;
    } catch (error) {
      console.error('User lookup error:', error);
      return null;
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchError(null);
  }, []);

  return {
    searchUsers,
    lookupUserWallet,
    clearSearch,
    searchResults,
    isSearching,
    searchError
  };
};
