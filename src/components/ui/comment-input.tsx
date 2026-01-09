// 🎯 Reusable Comment Input Component
// Single source of truth for comment forms with GIF support

import React, { useState } from 'react';
import { Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { GifPicker, type GifData } from '@/components/ui/gif-picker';
import { useUserProfile } from '@/features/profile';
import { cn } from '@/lib/utils';

export interface CommentInputProps {
  onSubmit: (text: string, gif?: GifData) => void;
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
  const [selectedGif, setSelectedGif] = useState<GifData | null>(null);
  const { profile } = useUserProfile();

  const currentUserAvatar = profile?.avatar_url;
  const currentUserName = profile?.username || profile?.first_name || 'User';
  const canSubmit = text.trim() || selectedGif;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit && !disabled) {
      onSubmit(text.trim(), selectedGif || undefined);
      setText('');
      setSelectedGif(null);
    }
  };

  const handleGifSelect = (gif: GifData) => {
    setSelectedGif(gif);
  };

  const handleRemoveGif = () => {
    setSelectedGif(null);
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
      <div className="flex-1 flex flex-col gap-2">
        {selectedGif && (
          <div className="relative inline-block">
            <img 
              src={selectedGif.previewUrl} 
              alt={selectedGif.alt || 'Selected GIF'} 
              className="h-16 rounded-lg object-cover"
            />
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={handleRemoveGif}
              aria-label="Remove selected GIF"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X className="h-3 w-3" aria-hidden="true" />
            </Button>
          </div>
        )}
        <div className="relative">
          <Input
            placeholder={placeholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={disabled}
            aria-label="Comment text"
            className="pr-16 bg-muted/50 border-border/50 focus:bg-background transition-colors focus-visible:ring-2 focus-visible:ring-primary"
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            <GifPicker onSelect={handleGifSelect} disabled={disabled} />
            <Button 
              type="submit" 
              size="sm"
              variant="ghost"
              disabled={!canSubmit || disabled}
              aria-label="Submit comment"
              className="h-7 w-7 p-0 text-primary hover:text-primary/80 disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
