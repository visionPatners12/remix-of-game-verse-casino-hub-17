import React from 'react';
import { Button, Avatar, AvatarImage, AvatarFallback, Badge } from '@/ui';
import { Users, UserPlus } from 'lucide-react';
import type { SuggestedUser } from '../types';
import { cn } from '@/lib/utils';

interface SuggestedUsersProps {
  users: SuggestedUser[];
  onUserClick?: (user: SuggestedUser) => void;
  onFollowClick?: (user: SuggestedUser) => void;
  className?: string;
  maxResults?: number;
  title?: string;
  isLoading?: boolean;
}

export const SuggestedUsers = React.memo<SuggestedUsersProps>(({
  users,
  onUserClick,
  onFollowClick,
  className,
  maxResults,
  title = "Suggested users",
  isLoading = false
}) => {
  const displayUsers = maxResults ? users.slice(0, maxResults) : users;

  const formatFollowerCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (displayUsers.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className={cn("", className)}>
      <div className="flex items-center gap-2 py-3 px-4 border-b border-border">
        <Users className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold text-foreground">{title}</h3>
        {isLoading && <span className="text-muted-foreground text-sm font-normal">Loading...</span>}
      </div>
      
      <div className="divide-y divide-border">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-muted/50 rounded-full animate-pulse" />
                <div>
                  <div className="h-4 bg-muted/50 rounded mb-1 w-20 animate-pulse" />
                  <div className="h-3 bg-muted/30 rounded w-16 animate-pulse" />
                </div>
              </div>
              <div className="h-8 w-16 bg-muted/30 rounded animate-pulse" />
            </div>
          ))
        ) : (
          displayUsers.map((user) => (
            <div 
              key={user.id} 
              className="flex items-center justify-between px-4 py-3 active:bg-muted/50 transition-colors group"
            >
              <button
                onClick={() => onUserClick?.(user)}
                className="flex items-center gap-3 flex-1 text-left"
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {user.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-foreground truncate">
                      @{user.username}
                    </span>
                    {user.verified && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5 shrink-0">
                        ✓
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="truncate">{user.name}</span>
                    {user.reason && (
                      <span className="text-xs text-primary/80 shrink-0">
                        {user.reason === 'follows_you' && '• Follows you'}
                        {user.reason === 'shared_interests' && '• Similar interests'}
                        {user.reason === 'shared_favorites' && '• Likes same sports'}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatFollowerCount(user.followers)} followers
                  </div>
                </div>
              </button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs ml-2 shrink-0"
                onClick={() => onFollowClick?.(user)}
              >
                <UserPlus className="h-3 w-3 mr-1" />
                Follow
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

SuggestedUsers.displayName = 'SuggestedUsers';