import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/ui';
import type { ReactionUser } from '@/types/feed';

// Re-export for backwards compatibility
export type { ReactionUser };

interface ReactionUsersListProps {
  users: ReactionUser[];
  type: 'likes' | 'comments';
  maxVisible?: number;
  className?: string;
}

export function ReactionUsersList({ users, type, maxVisible = 3, className }: ReactionUsersListProps) {
  
  if (!users || users.length === 0) {
    return null;
  }

  const visibleUsers = users.slice(0, maxVisible);
  const remainingCount = Math.max(0, users.length - maxVisible);

  const getUserDisplayName = (user: ReactionUser): string => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`.trim();
    }
    if (user.first_name) {
      return user.first_name;
    }
    return user.username || `User ${(user.user_id || user.id || 'unknown').slice(0, 8)}`;
  };

  const getUserInitials = (user: ReactionUser): string => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user.first_name) {
      return user.first_name[0].toUpperCase();
    }
    if (user.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getUserKey = (user: ReactionUser, index: number): string => {
    return user.user_id || user.id || `user-${index}`;
  };

  // Compact display with stacked avatars
  if (type === 'likes' && users.length > 1) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <div className="flex -space-x-1">
          {visibleUsers.map((user, index) => (
            <Avatar key={getUserKey(user, index)} className="w-5 h-5 border border-background">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {getUserInitials(user)}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          {users.length === 1 
            ? `${getUserDisplayName(users[0])} liked this`
            : users.length === 2
            ? `${getUserDisplayName(users[0])} and ${getUserDisplayName(users[1])} liked this`
            : `${getUserDisplayName(users[0])} and ${users.length - 1} others liked this`
          }
        </span>
      </div>
    );
  }

  // Simple list for comments or single likes
  return (
    <div className={`space-y-1 ${className}`}>
      {visibleUsers.map((user, index) => (
        <div key={getUserKey(user, index)} className="flex items-center gap-2 text-xs">
          <Avatar className="w-4 h-4">
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {getUserInitials(user)}
            </AvatarFallback>
          </Avatar>
          <span className="text-muted-foreground">
            <span className="font-medium text-foreground">{getUserDisplayName(user)}</span>
            {user.username && ` (@${user.username})`}
          </span>
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="text-xs text-muted-foreground pl-6">
          and {remainingCount} more {type === 'likes' ? 'liked this' : 'commented'}
        </div>
      )}
    </div>
  );
}