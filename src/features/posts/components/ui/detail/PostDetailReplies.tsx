import React from 'react';
// PostWrapper and SimplePost are deprecated - this component needs refactoring
// import { PostWrapper, SimplePost } from '@/features/social-feed';

interface PostDetailRepliesProps {
  replies: any[];
  onReplyReaction: (replyId: string) => any;
}

export function PostDetailReplies({ replies, onReplyReaction }: PostDetailRepliesProps) {
  return (
    <div className="space-y-4">
      {/* TODO: Refactor to use new post components */}
      <p className="text-sm text-muted-foreground">Replies feature under refactoring</p>
    </div>
  );
}