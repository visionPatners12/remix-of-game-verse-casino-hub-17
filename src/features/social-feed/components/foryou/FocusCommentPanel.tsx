// 🎯 Focus Comment Panel Component
// Desktop sidebar panel for comments in focus mode

import React from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { GifData } from '@/components/ui/gif-picker';
import { CommentInput } from '@/components/ui/comment-input';
import { CommentList } from '@/components/ui/comment-list';
import type { Comment } from '@/types/feed';

interface FocusCommentPanelProps {
  comments: Comment[];
  onAddComment?: (text: string, gif?: GifData) => void;
  isLoading?: boolean;
}

export function FocusCommentPanel({ comments, onAddComment, isLoading = false }: FocusCommentPanelProps) {
  const { t } = useTranslation('feed');
  
  const handleSubmit = (text: string, gif?: GifData) => {
    if (onAddComment) {
      onAddComment(text, gif);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Comments list */}
      <ScrollArea className="flex-1 px-4">
        {comments.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageCircle className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">{t('empty.noComments')}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('empty.beFirst')}</p>
          </div>
        ) : (
          <div className="py-4">
            <CommentList 
              comments={comments}
              isLoading={isLoading}
              emptyMessage=""
              emptySubMessage=""
            />
          </div>
        )}
      </ScrollArea>

      {/* Comment input at bottom */}
      <div className="flex-shrink-0 border-t border-border p-4">
        <CommentInput 
          onSubmit={handleSubmit}
          disabled={!onAddComment}
        />
      </div>
    </div>
  );
}
