import React, { useState, useEffect, useCallback, memo } from "react";
import { useMatchReactions } from "@/features/sports/hooks/useMatchReactions";
import { ReactionBar } from "@/features/social-feed/components/shared/ReactionBar";
import { CommentSection, Comment } from "@/features/social-feed/components/shared/CommentSection";

interface MatchReactionSectionProps {
  matchId: string;
}

export const MatchReactionSection = memo(function MatchReactionSection({ 
  matchId 
}: MatchReactionSectionProps) {
  const { reactions, toggleLike, addComment, loadReactions, loadComments } = useMatchReactions();
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  // Load reactions on mount
  useEffect(() => {
    if (matchId) {
      loadReactions([matchId]);
    }
  }, [matchId, loadReactions]);

  // Toggle comments visibility and load them
  const handleToggleComments = useCallback(async () => {
    if (!showComments) {
      setIsLoadingComments(true);
      try {
        const loaded = await loadComments(matchId);
        setComments(loaded);
      } finally {
        setIsLoadingComments(false);
      }
    }
    setShowComments(prev => !prev);
  }, [showComments, matchId, loadComments]);

  // Add a new comment
  const handleAddComment = useCallback(async (text: string) => {
    await addComment(matchId, text);
    // Refresh comments after adding
    const updated = await loadComments(matchId);
    setComments(updated);
  }, [matchId, addComment, loadComments]);

  const matchReaction = reactions[matchId] || { likes: 0, comments: 0, userLiked: false };

  return (
    <div className="px-4 py-2">
      <ReactionBar
        likes={matchReaction.likes}
        comments={matchReaction.comments}
        userLiked={matchReaction.userLiked}
        onLike={() => toggleLike(matchId)}
        onComment={handleToggleComments}
        postId={matchId}
      />
      <CommentSection
        comments={comments}
        onAddComment={handleAddComment}
        showComments={showComments}
        isLoadingComments={isLoadingComments}
      />
    </div>
  );
});
