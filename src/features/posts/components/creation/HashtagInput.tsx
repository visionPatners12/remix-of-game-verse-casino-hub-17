import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Hash, Plus, X } from 'lucide-react';

interface HashtagInputProps {
  hashtags: string[];
  newHashtag: string;
  onNewHashtagChange: (value: string) => void;
  onAddHashtag: () => void;
  onRemoveHashtag: (hashtag: string) => void;
}

export function HashtagInput({ 
  hashtags, 
  newHashtag, 
  onNewHashtagChange, 
  onAddHashtag, 
  onRemoveHashtag 
}: HashtagInputProps) {
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onAddHashtag();
    }
  };

  return (
    <div className="space-y-3">
      {/* Input pour nouveau hashtag */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Ajouter un hashtag"
            value={newHashtag}
            onChange={(e) => onNewHashtagChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onAddHashtag()}
          disabled={!newHashtag.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Liste des hashtags */}
      {hashtags.length > 0 && (
        <div className="flex gap-2 overflow-hidden">
          {hashtags.map((hashtag, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {hashtag}
              <button
                type="button"
                onClick={() => onRemoveHashtag(hashtag)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}