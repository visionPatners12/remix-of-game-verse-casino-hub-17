import { useUserBets } from '@/features/betting/hooks/useUserBets';
import { BetPostCard } from '@/features/social-feed/components/posts/cards/BetPostCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { FeedPost } from '@/types/feed';

interface UserBetsTabProps {
  userId: string;
}

export function UserBetsTab({ userId }: UserBetsTabProps) {
  const { data: bets, isLoading, error } = useUserBets(userId, 50);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">Error loading bets</p>
      </div>
    );
  }

  if (!bets || bets.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>No shared bets yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {bets.map((bet) => {
        // Transform bet to FeedPost format
        const post: FeedPost = {
          id: bet.id,
          type: 'bet',
          activityId: bet.id,
          author: {
            id: bet.user_id,
            username: (bet as any).users?.username || 'Unknown',
            fullName: `${(bet as any).users?.first_name || ''} ${(bet as any).users?.last_name || ''}`.trim() || 'Unknown',
            avatar: (bet as any).users?.avatar_url
          },
          timestamp: bet.created_at,
          content: bet.analysis || '',
          reactions: {
            likes: 0,
            comments: 0,
            shares: 0,
            userLiked: false
          },
          bet: {
            selections: bet.selections,
            bet_type: bet.bet_type === 'single' ? 'simple' : 'combiné',
            betAmount: bet.amount,
            currency: bet.currency as 'USDT',
            totalOdds: bet.odds,
            potentialWin: bet.potential_win
          }
        };

        return (
          <BetPostCard
            key={bet.id}
            post={post}
            reactions={{ likes: 0, comments: 0, shares: 0, userLiked: false }}
            comments={[]}
            showComments={false}
            isLoadingComments={false}
            onAddComment={() => {}}
            onToggleComments={() => {}}
            reactionHandlers={{
              onLike: () => {},
              onComment: () => {},
              onShare: () => {}
            }}
          />
        );
      })}
    </div>
  );
}
