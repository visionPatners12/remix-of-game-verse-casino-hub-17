// 🎯 Highlight Focus Mode Component
// Displays a highlight in fullscreen focus mode with comments

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { GifData } from '@/components/ui/gif-picker';
import { CommentInput } from '@/components/ui/comment-input';
import { CommentList } from '@/components/ui/comment-list';

import { HighlightPostComponent } from '@/features/posts/components/types/HighlightPostComponent';
import { FocusCommentPanel } from './FocusCommentPanel';
import { transformHighlightToPost } from '@/features/highlights/utils/highlightToPost';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFullscreen } from '@/contexts/FullscreenContext';
import type { PersonalizedHighlight } from '@/features/highlights/hooks/usePersonalizedHighlights';
import type { Comment, ReactionCounts, ReactionHandlers } from '@/types/feed';

interface HighlightFocusModeProps {
  highlight: PersonalizedHighlight;
  comments: Comment[];
  isLoadingComments?: boolean;
  onBack: () => void;
  onAddComment?: (comment: string, gif?: GifData) => void;
  reactions?: ReactionCounts;
  reactionHandlers?: ReactionHandlers;
}

export function HighlightFocusMode({
  highlight,
  comments,
  isLoadingComments = false,
  onBack,
  onAddComment,
  reactions,
  reactionHandlers,
}: HighlightFocusModeProps) {
  const { t } = useTranslation('feed');
  // Utiliser freezeOnFullscreen=true pour éviter les changements de layout lors de la rotation d'écran
  const isMobile = useIsMobile(true);
  const { enterFullscreen, exitFullscreen } = useFullscreen();

  const highlightPost = transformHighlightToPost(highlight);

  useEffect(() => {
    enterFullscreen();
    return () => exitFullscreen();
  }, [enterFullscreen, exitFullscreen]);

  const handleSubmit = (text: string, gif?: GifData) => {
    if (onAddComment) {
      onAddComment(text, gif);
    }
  };

  if (!isMobile) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-background pt-safe">
        <div className="h-full flex flex-col">
          <div className="border-b border-border/20 flex items-center gap-3 px-6 py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-0 h-auto hover:bg-transparent"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="font-semibold text-base">{t('focus.highlight')}</h2>
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto">
                <HighlightPostComponent
                  post={highlightPost}
                  reactions={reactions}
                  comments={[]}
                  showComments={false}
                  isLoadingComments={false}
                  onAddComment={() => {}}
                  onToggleComments={() => {}}
                  reactionHandlers={reactionHandlers}
                />
              </div>
            </div>

            <div className="w-[380px] border-l border-border/20 flex flex-col">
              <div className="px-4 py-3 border-b border-border/20">
                <h3 className="font-medium text-sm">{t('focus.comments')}</h3>
              </div>
              <div className="flex-1 overflow-hidden">
                <FocusCommentPanel
                  comments={comments}
                  onAddComment={onAddComment}
                />
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-background pt-safe">
      <div className="fixed inset-0 overflow-y-auto pt-safe">
        <div className="min-h-full flex items-start justify-center">
          <div className="w-full max-w-2xl bg-background border-x border-border/20 min-h-screen">
            
            <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border/20 flex items-center gap-3 px-4 py-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-0 h-auto hover:bg-transparent"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h2 className="font-semibold text-base">{t('focus.highlight')}</h2>
            </div>

            <div className="border-b border-border/20">
              <HighlightPostComponent
                post={highlightPost}
                reactions={reactions}
                comments={[]}
                showComments={false}
                isLoadingComments={false}
                onAddComment={() => {}}
                onToggleComments={() => {}}
                reactionHandlers={reactionHandlers}
              />
            </div>

            <div className="px-4 py-4 space-y-4">
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
