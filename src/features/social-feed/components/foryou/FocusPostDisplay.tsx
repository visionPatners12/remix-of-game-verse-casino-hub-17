import React from 'react';
import { createPostComponent } from '../posts';
import type { FeedPost, Comment, ReactionCounts, ReactionHandlers } from '@/types/feed';

interface FocusPostDisplayProps {
  post: FeedPost;
  comments: Comment[];
  reactions?: ReactionCounts;
  reactionHandlers?: ReactionHandlers;
  onToggleComments?: () => void;
}

const defaultReactions: ReactionCounts = { likes: 0, comments: 0, shares: 0, userLiked: false };
const defaultHandlers: ReactionHandlers = { onLike: () => {}, onComment: () => {}, onShare: () => {} };

/**
 * Composant qui réutilise exactement le même affichage que le feed principal
 * pour garantir une cohérence parfaite entre le feed et le focus mode
 */
export function FocusPostDisplay({ 
  post, 
  comments,
  reactions = defaultReactions,
  reactionHandlers = defaultHandlers,
  onToggleComments = () => {}
}: FocusPostDisplayProps) {
  // Utilise exactement le même composant que le feed principal
  return createPostComponent({
    post,
    reactions: reactions || post.reactions || defaultReactions,
    comments: comments,
    showComments: false,
    isLoadingComments: false,
    onAddComment: () => {},
    onToggleComments: onToggleComments,
    reactionHandlers: reactionHandlers,
  });
}