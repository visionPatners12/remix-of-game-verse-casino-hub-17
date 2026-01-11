import React, { useState, useCallback, useEffect } from 'react';
import { Search, User, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useUserWalletLookup, SearchedUser } from '../hooks/useUserWalletLookup';

interface UserSearchSendProps {
  onSelectUser: (user: SearchedUser) => void;
  onBack: () => void;
}

export const UserSearchSend: React.FC<UserSearchSendProps> = ({ onSelectUser, onBack }) => {
  const { t } = useTranslation('withdraw');
  const [query, setQuery] = useState('');
  const { searchUsers, searchResults, isSearching, searchError } = useUserWalletLookup();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        searchUsers(query);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchUsers]);

  const getDisplayName = (user: SearchedUser) => {
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return user.username || 'Unknown User';
  };

  const getInitials = (user: SearchedUser) => {
    if (user.first_name) return user.first_name[0].toUpperCase();
    if (user.username) return user.username[0].toUpperCase();
    return 'U';
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold">{t('userSearch.title', 'Send to User')}</h2>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('userSearch.placeholder', 'Search by username or name...')}
          className="pl-10 h-12 text-base"
          autoFocus
        />
      </div>

      {/* Results */}
      <div className="space-y-2 min-h-[200px]">
        {isSearching ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))
        ) : searchError ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">{searchError}</p>
          </div>
        ) : query.length < 2 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <User className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              {t('userSearch.hint', 'Enter at least 2 characters to search')}
            </p>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <User className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              {t('userSearch.noResults', 'No users found')}
            </p>
          </div>
        ) : (
          searchResults.map((user) => (
            <button
              key={user.id}
              onClick={() => user.wallet_address && onSelectUser(user)}
              disabled={!user.wallet_address}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                user.wallet_address
                  ? "hover:bg-muted/50 active:scale-[0.98] cursor-pointer"
                  : "opacity-50 cursor-not-allowed"
              )}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(user)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{getDisplayName(user)}</span>
                  {user.wallet_address && (
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  )}
                </div>
                
                {user.username && (
                  <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                )}
                
                {user.ens_subdomain && (
                  <p className="text-xs text-primary font-medium truncate">
                    {user.ens_subdomain}
                  </p>
                )}
                
                {user.wallet_address ? (
                  <p className="text-xs text-muted-foreground font-mono">
                    {formatAddress(user.wallet_address)}
                  </p>
                ) : (
                  <p className="text-xs text-amber-500">
                    {t('userSearch.noWallet', 'No wallet connected')}
                  </p>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default UserSearchSend;
