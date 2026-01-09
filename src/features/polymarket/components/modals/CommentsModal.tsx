import React, { useCallback } from 'react';
import {
  Drawer,
  DrawerContentPWA,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { CommentList } from '@/components/ui/comment-list';
import { CommentInput } from '@/components/ui/comment-input';
import { usePolymarketComments } from '../../hooks/usePolymarketComments';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Format comment date in a readable way
function formatCommentDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  if (diffInHours < 24) return `${diffInHours}h`;
  if (diffInDays < 7) return `${diffInDays}d`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

interface GifData {
  id: string;
  url: string;
  previewUrl: string;
  width: number;
  height: number;
  title: string;
}

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle?: string;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  isOpen,
  onClose,
  eventId,
  eventTitle,
}) => {
  const {
    comments,
    commentsCount,
    isLoading,
    isAdding,
    addComment,
    deleteComment,
    userId,
  } = usePolymarketComments(eventId);

  const handleSubmitComment = useCallback(async (text: string, gif?: GifData) => {
    await addComment(text, gif);
  }, [addComment]);

  // Transform comments for CommentList format
  const formattedComments = comments.map(comment => {
    // Build display name from user data (prénom + nom)
    const fullName = comment.first_name && comment.last_name
      ? `${comment.first_name} ${comment.last_name}`
      : comment.first_name || comment.last_name || comment.username || 'Anonymous';
    
    return {
      id: comment.id,
      avatar: comment.avatar_url || '',
      fullName: fullName,
      username: comment.username || 'anonymous',
      displayUsername: comment.username || 'anonymous',
      timestamp: formatCommentDate(comment.created_at),
      text: comment.content,
      gif: comment.gif_url ? {
        url: comment.gif_url,
        previewUrl: comment.gif_preview_url || comment.gif_url,
        width: comment.gif_width,
        height: comment.gif_height,
      } : undefined,
      isOwn: comment.user_id === userId,
      onDelete: comment.user_id === userId ? () => deleteComment(comment.id) : undefined,
    };
  });

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContentPWA 
        className="bg-background max-h-[85dvh]"
        enableKeyboardAdjust
      >
        <DrawerHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <DrawerTitle className="text-lg font-semibold truncate pr-4">
            Comments {commentsCount > 0 && `(${commentsCount})`}
          </DrawerTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </DrawerHeader>

        <div className="flex flex-col flex-1 overflow-hidden px-4">
          {/* Comments list */}
          <div className="flex-1 overflow-y-auto py-4 min-h-0">
            <CommentList
              comments={formattedComments}
              isLoading={isLoading}
              emptyMessage="No comments yet"
              emptySubMessage="Be the first to share your thoughts!"
            />
          </div>

          {/* Comment input */}
          <div className="sticky bottom-0 bg-background border-t border-border py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <CommentInput
              onSubmit={handleSubmitComment}
              disabled={isAdding || !userId}
              placeholder={userId ? "Add a comment..." : "Login to comment"}
              showAvatar
            />
          </div>
        </div>
      </DrawerContentPWA>
    </Drawer>
  );
};
