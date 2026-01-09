import React, { useMemo } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/ui';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { SearchUser } from '../types';
import { cn } from '@/lib/utils';
import { FollowButton } from '@/components/social/FollowButton';
import { useUserProfile } from '@/features/profile';

interface UserSearchResultsProps {
  results: SearchUser[];
  query: string;
  isLoading: boolean;
  onUserClick?: (user: SearchUser) => void;
  className?: string;
  showEmpty?: boolean;
  maxResults?: number;
}

export const UserSearchResults = React.memo<UserSearchResultsProps>(({
  results,
  query,
  isLoading,
  onUserClick,
  className,
  showEmpty = true,
  maxResults
}) => {
  const navigate = useNavigate();
  const { profile: currentUser } = useUserProfile();

  const handleUserClick = (user: SearchUser) => {
    onUserClick?.(user);
    navigate(`/user/${user.username}`);
  };

  // Filter out the current user from search results
  const filteredResults = useMemo(() => {
    if (!currentUser?.id) return results;
    return results.filter(user => user.id !== currentUser.id);
  }, [results, currentUser?.id]);

  const displayResults = maxResults ? filteredResults.slice(0, maxResults) : filteredResults;

  const getUserDisplayName = (user: SearchUser) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.username || 'User';
  };

  const getUserInitials = (user: SearchUser) => {
    if (user.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return '??';
  };

  if (!query && !isLoading) {
    return null;
  }

  return (
    <div className={cn("", className)}>
      <div className="flex items-center gap-2 py-3 px-4 border-b border-border">
        <Users className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">
          Users
          {isLoading && <span className="ml-2 text-muted-foreground font-normal">Searching...</span>}
        </h3>
      </div>
      
      <div className="divide-y divide-border">
        {displayResults.length > 0 ? (
          displayResults.map((user) => (
            <button
              key={user.id}
              onClick={() => handleUserClick(user)}
              className="w-full flex items-center gap-3 px-4 py-3 active:bg-accent/50 transition-colors group"
            >
              <Avatar className="h-11 w-11 shrink-0">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getUserInitials(user)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-left min-w-0">
                <div className="font-semibold text-foreground truncate">
                  {getUserDisplayName(user)}
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  @{user.username}
                </div>
                {user.bio && (
                  <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {user.bio}
                  </div>
                )}
              </div>
              
              <FollowButton targetUserId={user.id} size="sm" className="flex-shrink-0" />
            </button>
          ))
        ) : !isLoading && showEmpty && query ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No users found for "{query}"</p>
          </div>
        ) : null}
        
        {maxResults && results.length > maxResults && (
          <div className="px-4 py-3 border-t border-border text-center">
            <span className="text-xs text-muted-foreground">
              +{results.length - maxResults} more results
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

UserSearchResults.displayName = 'UserSearchResults';