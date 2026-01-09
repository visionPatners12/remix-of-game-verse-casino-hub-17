// 🎯 Focus Mode Component
// Simple focus mode to display a post with its comments

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { GifData } from '@/components/ui/gif-picker';
import { CommentInput } from '@/components/ui/comment-input';
import { CommentList } from '@/components/ui/comment-list';

import { FocusPostDisplay } from './FocusPostDisplay';
import { DesktopFocusMode } from './DesktopFocusMode';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFullscreen } from '@/contexts/FullscreenContext';
import type { FeedPost, Comment, ReactionCounts, ReactionHandlers } from '@/types/feed';
import type { FeedFilter } from '@/types/feed/state';


interface FocusModeProps {
  post: FeedPost;
  comments: Comment[];
  isLoadingComments?: boolean;
  onBack: () => void;
  onAddComment?: (comment: string, gif?: GifData) => void;
  selectedFilter?: FeedFilter;
  onFilterSelect?: (filter: FeedFilter) => void;
  reactions?: ReactionCounts;
  reactionHandlers?: ReactionHandlers;
  onToggleComments?: () => void;
}

export function FocusMode({ 
  post, 
  comments, 
  isLoadingComments = false,
  onBack, 
  onAddComment,
  selectedFilter = 'foryou',
  onFilterSelect = () => {},
  reactions,
  reactionHandlers,
  onToggleComments
}: FocusModeProps) {
  const { t } = useTranslation('feed');
  const isMobile = useIsMobile();
  const { enterFullscreen, exitFullscreen } = useFullscreen();

  useEffect(() => {
    enterFullscreen();
    return () => exitFullscreen();
  }, [enterFullscreen, exitFullscreen]);

  if (!isMobile) {
    return (
      <DesktopFocusMode 
        post={post}
        comments={comments}
        onBack={onBack}
        onAddComment={onAddComment}
      />
    );
  }

  const handleSubmit = (text: string, gif?: GifData) => {
    if (onAddComment) {
      onAddComment(text, gif);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-background pt-safe">
      <div className="fixed inset-0 overflow-y-auto pt-safe">
        <div className="min-h-full flex items-start justify-center">
          <div className="w-full max-w-2xl bg-background border-x border-border min-h-screen md:min-h-0 md:my-8 md:rounded-lg md:shadow-lg">
            
            <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border flex items-center gap-3 px-4 md:px-6 py-4 md:rounded-t-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-0 h-auto hover:bg-transparent"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h2 className="font-semibold text-base">{t('focus.post')}</h2>
            </div>

            <div className="border-b border-border">
              <FocusPostDisplay 
                post={post} 
                comments={comments}
                reactions={reactions}
                reactionHandlers={reactionHandlers}
                onToggleComments={onToggleComments}
              />
            </div>

            <div className="px-4 md:px-6 py-4 space-y-4">
              <CommentInput 
                onSubmit={handleSubmit}
                disabled={!onAddComment}
              />

              <CommentList 
                comments={comments}
                isLoading={isLoadingComments}
              />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
