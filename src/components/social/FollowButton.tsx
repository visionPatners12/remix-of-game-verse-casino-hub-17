import React from 'react';
import { useFollow } from '@/hooks/useFollow';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
  targetUserId: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const FollowButton = React.memo<FollowButtonProps>(({ 
  targetUserId, 
  size = 'sm', 
  className,
  onClick 
}) => {
  const { user } = useAuth();
  const { followUser, isFollowing, loading } = useFollow(targetUserId);

  // Don't show if viewing own profile or not authenticated
  if (!user || user.id === targetUserId) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation on click
    e.preventDefault();
    onClick?.(e);
    followUser();
  };

  return (
    <Button
      size={size}
      variant={isFollowing ? 'outline' : 'default'}
      className={cn(
        isFollowing && 'border-muted-foreground/30',
        className
      )}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  );
});

FollowButton.displayName = 'FollowButton';
