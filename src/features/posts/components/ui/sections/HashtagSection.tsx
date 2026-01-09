import React from 'react';
import { Hash } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { HashtagInput } from '@/features/posts';

interface HashtagSectionProps {
  hashtags: string[];
  newHashtag: string;
  onNewHashtagChange: (value: string) => void;
  onAddHashtag: () => void;
  onRemoveHashtag: (hashtag: string) => void;
}

export function HashtagSection({ 
  hashtags, 
  newHashtag, 
  onNewHashtagChange,
  onAddHashtag,
  onRemoveHashtag 
}: HashtagSectionProps) {
  return (
    <div className="mb-6">
      <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
        <Hash className="h-4 w-4" />
        Hashtags
      </Label>
      <HashtagInput
        hashtags={hashtags}
        newHashtag={newHashtag}
        onNewHashtagChange={onNewHashtagChange}
        onAddHashtag={onAddHashtag}
        onRemoveHashtag={onRemoveHashtag}
      />
    </div>
  );
}