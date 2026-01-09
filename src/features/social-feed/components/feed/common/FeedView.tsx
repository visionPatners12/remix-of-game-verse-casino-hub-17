import React, { useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { createPostComponent } from '../../posts';
import type { BasePostProps } from '../../posts/base/BasePostProps';
import type { FeedPost } from '@/types/feed';
import type { FeedActionsInterface } from '@/features/social-feed/types';

interface FeedViewProps {
  posts: FeedPost[];
  focusedPostId: string | null;
  onFocusPost: (postId: string | null) => void;
  expandedComments: Record<string, boolean>;
  feedActions: FeedActionsInterface;
}

export function FeedView({ 
  posts, 
  focusedPostId, 
  onFocusPost, 
  expandedComments, 
  feedActions 
}: FeedViewProps) {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);

  // Touch handling for mobile
  const handleTouchStart = useRef({ x: 0, y: 0 });
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - handleTouchStart.current.x;
    const deltaY = touch.clientY - handleTouchStart.current.y;
    
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 20) {
      e.preventDefault();
    }
  };

  const handleTouchStartCapture = (e: React.TouchEvent) => {
    if (!isMobile) return;
    const touch = e.touches[0];
    handleTouchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  return (
    <div className="pb-4">
      {/* Back button when in focus mode */}
      {focusedPostId && (
        <div className="p-4 border-b">
          <button 
            onClick={() => onFocusPost(null)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onFocusPost(null);
              }
            }}
            aria-label="Back to feed"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
          >
            ← Back to feed
          </button>
        </div>
      )}
      
      <div
        ref={containerRef}
        role="feed"
        aria-busy={false}
        aria-label="Social feed"
        className={isMobile ? 'touch-pan-y' : ''}
        onTouchStart={handleTouchStartCapture}
        onTouchMove={handleTouchMove}
        style={isMobile ? {
          overflowX: 'hidden',
          touchAction: 'pan-y',
          WebkitOverflowScrolling: 'touch'
        } as React.CSSProperties : undefined}
      >
        {posts.map((post, index) => {
          const isDetailView = !!focusedPostId;
          const reactions = feedActions.getPostReactions(post, post.streamReactionData || {});
          const comments = feedActions.getPostComments(post);

          const postProps: BasePostProps = {
            post,
            reactions,
            comments,
            showComments: expandedComments[post.id] || false,
            isLoadingComments: false,
            onAddComment: (text) => feedActions.handleAddComment(post.id, text),
            onToggleComments: () => feedActions.toggleComments(post.id),
            reactionHandlers: feedActions.reactionHandlers
          };

          const handlePostClick = (e: React.MouseEvent) => {
            if (isDetailView) return;
            
            const target = e.target as HTMLElement;
            const isInteractiveElement = target.closest('button, a, input, textarea, [role="button"]');
            
            if (!isInteractiveElement) {
              onFocusPost(post.id);
            }
          };

          const handleKeyDown = (e: React.KeyboardEvent) => {
            if (isDetailView) return;
            if (e.key === 'Enter' || e.key === ' ') {
              const target = e.target as HTMLElement;
              const isInteractiveElement = target.closest('button, a, input, textarea, [role="button"]');
              if (!isInteractiveElement) {
                e.preventDefault();
                onFocusPost(post.id);
              }
            }
          };

          return (
            <div 
              key={post.id} 
              onClick={handlePostClick}
              onKeyDown={handleKeyDown}
              role="article"
              aria-posinset={index + 1}
              aria-setsize={posts.length}
              aria-label={`Post by ${post.author.fullName}`}
              tabIndex={0}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
            >
              {createPostComponent(postProps)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
