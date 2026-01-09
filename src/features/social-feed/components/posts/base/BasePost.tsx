import React, { memo, useMemo, useCallback } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/ui';
import { CommentSection } from '@/features/social-feed/components/shared/CommentSection';
import { ReactionBar } from '@/features/social-feed/components/shared/ReactionBar';
import { ReactionUsersList } from '@/features/social-feed/components/shared/ReactionUsersList';
import { useNavigate } from 'react-router-dom';
import { formatTimeAgo } from '@/utils/dateUtils';
import { useNormalizedHashtags } from '../hooks/useNormalizedHashtags';
import { cn } from '@/lib/utils';
import type { FeedPost, ReactionCounts, Comment, ReactionHandlers } from '@/types/feed';
import type { BasePostProps } from './BasePostProps';

interface BasePostContentProps extends BasePostProps {
  children: React.ReactNode;
}

/**
 * Base post component with common functionality - memoized for performance
 */
export const BasePost = memo(function BasePost({
  post,
  reactions,
  comments,
  showComments,
  isLoadingComments,
  onAddComment,
  onToggleComments,
  reactionHandlers,
  onFocusPost,
  children
}: BasePostContentProps) {
  const navigate = useNavigate();
  
  // Use memoized hashtag normalization
  const postWithTags = post as FeedPost & { tags?: unknown; hashtags?: unknown };
  const normalizedHashtags = useNormalizedHashtags(postWithTags.tags, postWithTags.hashtags);

  // PERF FIX: Memoize profile click handler - navigate to league for highlights
  const handleProfileClick = useCallback(() => {
    if (post.type === 'highlight') {
      navigate(`/league/unknown/unknown/${post.author.id}`);
    } else {
      navigate(`/user/${post.author.username}`);
    }
  }, [navigate, post.author.id, post.author.username, post.type]);

  // PERF FIX: Memoize time formatting
  const formattedTime = useMemo(() => formatTimeAgo(post.timestamp), [post.timestamp]);

  // PERF FIX: Memoize author initials
  const authorInitials = useMemo(() => 
    post.author.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    [post.author.fullName]
  );

  // PERF FIX: Memoize comment data transformation
  const mappedComments = useMemo(() => 
    (comments || []).map(c => ({
      id: c.id || '',
      username: c.username || '',
      fullName: c.fullName || c.username || '',
      displayUsername: c.displayUsername || `@${c.username || 'anonymous'}`,
      avatar: c.avatar,
      text: c.text || '',
      timestamp: c.timestamp || new Date().toISOString()
    })),
    [comments]
  );

  const handleAvatarKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleProfileClick();
    }
  }, [handleProfileClick]);

  // Handle click on post to open focus mode (only if not clicking interactive elements)
  const handleArticleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInteractive = target.closest('button, a, [role="button"], input, textarea, .reaction-bar, video, .video-player');
    
    if (!isInteractive && onFocusPost) {
      onFocusPost();
    }
  }, [onFocusPost]);

  return (
    <article 
      className="hover:bg-muted/20 transition-all duration-300 cursor-pointer border-b border-border/50 group"
      aria-labelledby={`post-author-${post.id}`}
      onClick={handleArticleClick}
    >
      <div className="px-4 py-3">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar 
            className={cn(
              "w-11 h-11 cursor-pointer flex-shrink-0 transition-all duration-300",
              "ring-2 ring-primary/20 group-hover:ring-primary/40",
              "hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            )}
            onClick={handleProfileClick}
            onKeyDown={handleAvatarKeyDown}
            tabIndex={0}
            role="button"
            aria-label={`View ${post.author.fullName}'s profile`}
          >
            <AvatarImage src={post.author.avatar} alt={`${post.author.fullName}'s avatar`} className="object-cover" />
            <AvatarFallback className="bg-gradient-to-br from-primary via-primary/80 to-primary/60 text-primary-foreground font-bold text-sm">
              {authorInitials}
            </AvatarFallback>
          </Avatar>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                id={`post-author-${post.id}`}
                onClick={handleProfileClick}
                aria-label={`View ${post.author.fullName}'s profile`}
                className="font-semibold text-foreground hover:text-primary transition-colors duration-200 text-sm p-0 h-auto relative group/name focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
              >
                {post.author.fullName}
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-primary transition-all duration-200 group-hover/name:w-full" aria-hidden="true" />
              </button>
              <button
                onClick={handleProfileClick}
                aria-label={`View @${post.author.username}'s profile`}
                className="text-muted-foreground hover:text-primary transition-colors duration-200 text-xs p-0 h-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
              >
                @{post.author.username}
              </button>
              <span className="text-muted-foreground/50 text-xs" aria-hidden="true">•</span>
              <time className="text-muted-foreground/70 text-xs font-medium" dateTime={post.timestamp}>{formattedTime}</time>
            </div>
            
            {normalizedHashtags.length > 0 && (
              <div className="flex items-center gap-1.5 mt-1.5 overflow-hidden">
                {normalizedHashtags.map((tag, index) => (
                  <span
                    key={index}
                    className={cn(
                      "text-[10px] text-primary/80 hover:text-primary transition-colors cursor-pointer whitespace-nowrap",
                      "bg-primary/5 hover:bg-primary/10 px-2 py-0.5 rounded-full font-medium"
                    )}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="transition-opacity duration-200">{children}</div>

        {/* Reactions */}
        {post.streamReactionData?.latest_reactions?.like && post.streamReactionData.latest_reactions.like.length > 0 && (
          <div className="mt-3 px-1">
            <ReactionUsersList
              users={post.streamReactionData.latest_reactions.like}
              type="likes"
              maxVisible={3}
            />
          </div>
        )}

        <div className="mt-2">
          <ReactionBar
            likes={reactions.likes}
            comments={reactions.comments}
            userLiked={reactions.userLiked}
            onLike={reactionHandlers.onLike}
            onComment={reactionHandlers.onComment}
            postId={post.activityId}
          />
        </div>

        {/* Comments */}
        <CommentSection
          comments={mappedComments}
          onAddComment={onAddComment}
          showComments={showComments}
          isLoadingComments={isLoadingComments}
        />
      </div>
    </article>
  );
});
