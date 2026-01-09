// 🎯 Match Focus Mode Component
// Displays a match in fullscreen focus mode with comments

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMatchNavigation } from '@/hooks/useMatchNavigation';
import type { GifData } from '@/components/ui/gif-picker';
import { CommentInput } from '@/components/ui/comment-input';
import { CommentList } from '@/components/ui/comment-list';

import { UnifiedMatchCard } from '@/components/matches';
import { FocusCommentPanel } from './FocusCommentPanel';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFullscreen } from '@/contexts/FullscreenContext';
import type { MatchData } from '@/features/sports/types';
import type { Comment, ReactionCounts } from '@/types/feed';

interface MatchFocusModeProps {
  match: MatchData & { id?: string };
  comments: Comment[];
  isLoadingComments?: boolean;
  onBack: () => void;
  onAddComment?: (comment: string, gif?: GifData) => void;
  reactions?: ReactionCounts;
  onLike?: () => void;
}

export function MatchFocusMode({
  match,
  comments,
  isLoadingComments = false,
  onBack,
  onAddComment,
  reactions,
  onLike,
}: MatchFocusModeProps) {
  const { t } = useTranslation('feed');
  const isMobile = useIsMobile();
  const { enterFullscreen, exitFullscreen } = useFullscreen();
  const { navigateFromAzuroGameId, navigateToMatchById } = useMatchNavigation();

  const handleGoToMatchDetails = async () => {
    // First try match.id (Supabase UUID)
    if (match.id) {
      navigateToMatchById(match.id);
      return;
    }
    // Fallback to Azuro game ID lookup
    const gameId = (match as { azuroGameId?: string; gameId?: string }).azuroGameId || 
                   (match as { azuroGameId?: string; gameId?: string }).gameId;
    if (gameId) {
      await navigateFromAzuroGameId(gameId);
    }
  };

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
          <div className="border-b border-border flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-0 h-auto hover:bg-transparent"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h2 className="font-semibold text-base">{t('focus.match')}</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoToMatchDetails}
              className="text-muted-foreground hover:text-foreground gap-1.5 pr-2"
            >
              {t('focus.goToMatch')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto">
                <UnifiedMatchCard
                  match={match}
                  variant="feed"
                  reactions={reactions}
                  comments={[]}
                  showComments={false}
                  isLoadingComments={false}
                  onAddComment={() => {}}
                  onToggleComments={() => {}}
                  onLike={onLike}
                />
              </div>
            </div>

            <div className="w-[380px] border-l border-border flex flex-col">
              <div className="px-4 py-3 border-b border-border">
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
          <div className="w-full max-w-2xl bg-background border-x border-border min-h-screen">
            
            <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="p-0 h-auto hover:bg-transparent"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h2 className="font-semibold text-base">{t('focus.match')}</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoToMatchDetails}
                className="text-muted-foreground hover:text-foreground gap-1.5 pr-2"
              >
                {t('focus.goToMatch')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="border-b border-border">
              <UnifiedMatchCard
                match={match}
                variant="feed"
                reactions={reactions}
                comments={[]}
                showComments={false}
                isLoadingComments={false}
                onAddComment={() => {}}
                onToggleComments={() => {}}
                onLike={onLike}
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
