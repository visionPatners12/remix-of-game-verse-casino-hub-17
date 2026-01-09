import React from 'react';
import { Avatar, AvatarFallback, AvatarImage, Input } from '@/ui';
import { Button } from '@/components/ui/button';

interface PostDetailReplyFormProps {
  replyText: string;
  onReplyTextChange: (text: string) => void;
  onReply: () => void;
}

export function PostDetailReplyForm({ replyText, onReplyTextChange, onReply }: PostDetailReplyFormProps) {
  return (
    <div className="border-b border-border p-4">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src="/placeholder-avatar.jpg" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div className="flex-1 flex items-center gap-3">
          <Input
            value={replyText}
            onChange={(e) => onReplyTextChange(e.target.value)}
            placeholder="Write your reply..."
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && onReply()}
          />
          <Button 
            onClick={onReply}
            disabled={!replyText.trim()}
            className="px-6"
          >
            Reply
          </Button>
        </div>
      </div>
    </div>
  );
}