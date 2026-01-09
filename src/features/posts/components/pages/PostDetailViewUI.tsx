import React, { useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { logger } from '@/utils/logger';
import { usePostNavigation } from '@/hooks/usePostNavigation';
import { useTimelineFeed } from '@/hooks/useTimelineFeed';
import { useAuth } from '@/features/auth';
import { useGetStream } from '@/contexts/StreamProvider';
import { useBaseFeedOperations } from '@/hooks/feed/useBaseFeedOperations';
import { SidePanel } from '@/features/social-feed/components/feed/common/SidePanel';
import { 
  PostDetailHeader, 
  PostDetailContent, 
  PostDetailReplyForm, 
  PostDetailReplies 
} from '@/features/posts/components/ui';

export function PostDetailViewUI() {
  const { postId } = useParams<{ postId: string }>();
  const { navigateBack } = usePostNavigation();
  const { user } = useAuth();
  const { isReady } = useGetStream();
  const [replyText, setReplyText] = useState('');

  // Use timeline feed to get activities
  const { activities, isLoading } = useTimelineFeed({
    userId: user?.id,
    limit: 50,
    enabled: !!user?.id && isReady
  });

  // Use base feed operations for reactions/comments
  const { 
    feedPosts,
    expandedComments,
    createReactionHandlers,
    toggleComments,
    addPostComment
  } = useBaseFeedOperations(activities);

  // Find the specific post
  const post = useMemo(() => 
    feedPosts.find(p => p.id === postId || p.activityId === postId),
    [feedPosts, postId]
  );

  const handleReply = useCallback(() => {
    if (replyText.trim() && post) {
      addPostComment(post, replyText.trim());
      setReplyText('');
    }
  }, [replyText, post, addPostComment]);

  const handleAddComment = useCallback(async (_postId: string, text: string) => {
    if (post) {
      await addPostComment(post, text);
    }
  }, [post, addPostComment]);

  const mockReplies = [
    {
      id: 'reply-1',
      author: { username: 'user123', fullName: 'User 123', avatar: '/placeholder-avatar.jpg' },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      text: "Excellent analysis! I agree with your prediction.",
      reactions: { likes: 5, comments: 2, shares: 1, userLiked: false },
      tags: []
    },
    {
      id: 'reply-2', 
      author: { username: 'bettor_pro', fullName: 'Bettor Pro', avatar: '/placeholder-avatar.jpg' },
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      text: "Interesting, but I think Liverpool has better chances.",
      reactions: { likes: 12, comments: 0, shares: 3, userLiked: true },
      tags: ['Liverpool', 'Stats']
    }
  ];

  const handleReplyReaction = (replyId: string) => ({
    onLike: () => logger.debug(`Like reply ${replyId}`),
    onComment: () => logger.debug(`Comment on reply ${replyId}`),
    onShare: () => logger.debug(`Share reply ${replyId}`)
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="flex-1 max-w-2xl mx-auto">
          <PostDetailHeader onNavigateBack={navigateBack} />
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
        <div className="hidden lg:block w-80 flex-shrink-0">
          <SidePanel />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="flex-1 max-w-2xl mx-auto">
          <PostDetailHeader onNavigateBack={navigateBack} />
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Post not found</p>
          </div>
        </div>
        <div className="hidden lg:block w-80 flex-shrink-0">
          <SidePanel />
        </div>
      </div>
    );
  }

  // Create a streamPost-like object for PostDetailContent
  const streamPost = {
    id: post.id,
    type: post.type as 'tip' | 'prediction' | 'opinion' | 'bet' | 'simple_post',
    author: post.author,
    content: post.content,
    timestamp: post.timestamp,
    tags: post.tags || [],
    reactions: post.reactions,
    activityId: post.activityId,
    prediction: post.prediction
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 max-w-2xl mx-auto">
        <PostDetailHeader onNavigateBack={navigateBack} />
        <PostDetailContent 
          streamPost={streamPost}
          expandedComments={expandedComments}
          onAddComment={handleAddComment}
          onToggleComments={toggleComments}
          onReaction={createReactionHandlers(post)}
        />
        <PostDetailReplyForm 
          replyText={replyText}
          onReplyTextChange={setReplyText}
          onReply={handleReply}
        />
        <PostDetailReplies 
          replies={mockReplies}
          onReplyReaction={handleReplyReaction}
        />
      </div>
      <div className="hidden lg:block w-80 flex-shrink-0">
        <SidePanel />
      </div>
    </div>
  );
}
