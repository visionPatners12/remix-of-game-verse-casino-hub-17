import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share, Repeat2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { usePolymarketLikes } from '../../hooks/usePolymarketLikes';
import { usePolymarketComments } from '../../hooks/usePolymarketComments';
import { CommentsModal } from '../modals/CommentsModal';

interface ReactionSectionProps {
  eventId: string;
  marketId?: string;
  commentsCount?: number;
  onShare?: () => void;
}

export const ReactionSection: React.FC<ReactionSectionProps> = ({
  eventId,
  marketId,
  commentsCount: apiCommentsCount = 0,
  onShare,
}) => {
  const [showComments, setShowComments] = useState(false);
  
  // Use the likes hook with eventId
  const { likesCount, isLiked, toggleLike, isToggling } = usePolymarketLikes(eventId);
  
  // Use local comments count (more accurate)
  const { commentsCount: localCommentsCount } = usePolymarketComments(eventId);
  
  // Display the max of local and API count
  const displayCommentsCount = Math.max(localCommentsCount, apiCommentsCount);

  const handleLike = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike();
  }, [toggleLike]);

  const handleComment = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowComments(true);
  }, []);

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const shareUrl = `${window.location.origin}/polymarket/event/${eventId}`;
    const shareData = {
      title: 'Check out this prediction market',
      text: 'Interesting prediction market on Polymarket',
      url: shareUrl,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return;
      }
    } catch (error) {
      // Native sharing failed, continue to clipboard fallback
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Link copied to clipboard!');
    }
    
    onShare?.();
  };

  return (
    <>
      <div className="flex items-center justify-between pt-3 border-t border-border/30">
        <div className="flex items-center justify-between w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleComment}
            className="flex items-center gap-1 px-2 py-1 h-8 text-muted-foreground hover:text-primary transition-all duration-200 hover:bg-primary/5 rounded-md"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">{formatCount(displayCommentsCount)}</span>
          </Button>
          
          {/* Bouton repost grisé et désactivé */}
          <div className="flex items-center gap-1 px-2 py-1 h-8 text-muted-foreground/50 cursor-not-allowed">
            <Repeat2 className="w-4 h-4" />
            <span className="text-sm">0</span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={isToggling}
            className={cn(
              "flex items-center gap-1 px-2 py-1 h-8 transition-all duration-200 rounded-md group",
              isLiked 
                ? 'text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30' 
                : 'text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
            )}
          >
            <Heart className={cn(
              "w-4 h-4 transition-all duration-200",
              isLiked ? 'fill-current' : ''
            )} />
            <span className="text-sm">{formatCount(likesCount)}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center gap-1 px-2 py-1 h-8 text-muted-foreground hover:text-primary transition-all duration-200 hover:bg-primary/5 rounded-md"
          >
            <Share className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Comments Modal - stopPropagation pour éviter de cliquer sur la carte */}
      <div onClick={(e) => e.stopPropagation()}>
        <CommentsModal
          isOpen={showComments}
          onClose={() => setShowComments(false)}
          eventId={eventId}
        />
      </div>
    </>
  );
};
