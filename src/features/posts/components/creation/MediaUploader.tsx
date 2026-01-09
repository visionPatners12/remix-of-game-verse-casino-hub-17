import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Image, Video, X } from 'lucide-react';
import type { MediaFile } from '../../types/creation';

interface MediaUploaderProps {
  mediaFiles: MediaFile[];
  onMediaUpload: (files: MediaFile[]) => void;
  onRemoveMedia: (index: number) => void;
}

export function MediaUploader({ mediaFiles, onMediaUpload, onRemoveMedia }: MediaUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    const newMediaFiles = files.map(file => {
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith('image/') ? 'image' : 'video';
      
      return { file, url, type } as MediaFile;
    });
    
    onMediaUpload(newMediaFiles);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {/* Upload Button */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2"
        >
          <Image className="h-4 w-4" />
          Ajouter média
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={handleMediaUpload}
        />
      </div>

      {/* Media Preview */}
      {mediaFiles.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {mediaFiles.map((media, index) => (
            <div key={index} className="relative group">
              <div className="relative rounded-lg overflow-hidden bg-muted aspect-video">
                {media.type === 'image' ? (
                  <img
                    src={media.url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="h-8 w-8 text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Vidéo</span>
                  </div>
                )}
              </div>
              
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 p-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemoveMedia(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}