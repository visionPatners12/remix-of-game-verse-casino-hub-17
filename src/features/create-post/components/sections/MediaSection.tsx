import React from 'react';
import { Image } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { MediaUploader } from '../creation/MediaUploader';

interface MediaSectionProps {
  mediaFiles: any[];
  onMediaUpload: (files: any[]) => void;
  onRemoveMedia: (index: number) => void;
}

export function MediaSection({ mediaFiles, onMediaUpload, onRemoveMedia }: MediaSectionProps) {
  return (
    <div className="mb-6">
      <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
        <Image className="h-4 w-4" />
        Media
      </Label>
      <MediaUploader
        mediaFiles={mediaFiles}
        onMediaUpload={(files) => onMediaUpload(files)}
        onRemoveMedia={onRemoveMedia}
      />
    </div>
  );
}