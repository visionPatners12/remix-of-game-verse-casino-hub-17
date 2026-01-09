import { useUserPredictions } from '@/features/posts/hooks/usePredictions';
import { TipPostCard } from '@/features/social-feed/components/posts/cards/TipPostCard';
import { mapPredictionToPost } from '@/features/posts/utils/predictionMapper';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface UserPredictionsTabProps {
  userId: string;
}

export function UserPredictionsTab({ userId }: UserPredictionsTabProps) {
  const { data: predictions, isLoading, error } = useUserPredictions(userId, 50);

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
        <p className="text-destructive">Error loading predictions</p>
      </div>
    );
  }

  if (!predictions || predictions.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>No predictions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {predictions.map((prediction) => {
        const post = mapPredictionToPost(prediction);
        
        return (
          <TipPostCard
            key={prediction.id}
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
