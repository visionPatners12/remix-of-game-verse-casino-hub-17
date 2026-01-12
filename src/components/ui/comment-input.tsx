// 🎯 Reusable Comment Input Component
// Single source of truth for comment forms

import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useUserProfile } from '@/features/profile';
import { cn } from '@/lib/utils';

export interface CommentInputProps {
  onSubmit: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  showAvatar?: boolean;
}

export function CommentInput({ 
  onSubmit, 
  disabled = false, 
  placeholder = "Add a comment...",
  className,
  showAvatar = true
}: CommentInputProps) {
  const [text, setText] = useState('');
  const { profile } = useUserProfile();

  const currentUserAvatar = profile?.avatar_url;
  const currentUserName = profile?.username || profile?.first_name || 'User';
  const canSubmit = text.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit && !disabled) {
      onSubmit(text.trim());
      setText('');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn("flex items-center gap-3", className)}
      aria-label="Add a comment"
    >
      {showAvatar && (
        <Avatar className="h-8 w-8 flex-shrink-0" aria-hidden="true">
          <AvatarImage src={currentUserAvatar} alt="" />
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {currentUserName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      <div className="flex-1">
        <div className="relative">
          <Input
            placeholder={placeholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={disabled}
            aria-label="Comment text"
            className="pr-10 bg-muted/50 border-border/50 focus:bg-background transition-colors focus-visible:ring-2 focus-visible:ring-primary"
          />
          <Button 
            type="submit" 
            size="sm"
            variant="ghost"
            disabled={!canSubmit || disabled}
            aria-label="Submit comment"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-primary hover:text-primary/80 disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </form>
  );
}
