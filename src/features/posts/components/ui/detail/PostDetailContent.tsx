import React from 'react';
import { createPostComponent } from '@/features/social-feed/components/posts';
import type { BasePostProps } from '@/features/social-feed/components/posts/base/BasePostProps';

interface PostDetailContentProps {
  streamPost: any;
  expandedComments: any;
  onAddComment: (postId: string, comment: string) => void;
  onToggleComments: (postId: string) => void;
  onReaction: any;
  
}

export function PostDetailContent({ 
  streamPost, 
  expandedComments,
  onAddComment,
  onToggleComments,
  onReaction,
}: PostDetailContentProps) {
  const postProps: BasePostProps = {
    post: streamPost,
    reactions: streamPost.reactions || { likes: 0, comments: 0, shares: 0, userLiked: false },
    comments: [],
    showComments: expandedComments[streamPost.id] || false,
    isLoadingComments: false,
    onAddComment: (text) => onAddComment(streamPost.id, text),
    onToggleComments: () => onToggleComments(streamPost.id),
    reactionHandlers: onReaction
  };

  return (
    <div className="border-b border-border">
      {createPostComponent(postProps)}
    </div>
  );
}