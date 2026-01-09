import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Image, X } from 'lucide-react';
import { toast } from 'sonner';
import type { MediaFile } from '../../types/creation';

const MAX_VIDEO_DURATION = 140; // 2 min 20 sec like Twitter

interface MediaUploaderProps {
  mediaFiles: MediaFile[];
  onMediaUpload: (files: MediaFile[]) => void;
  onRemoveMedia: (index: number) => void;
}

export function MediaUploader({ mediaFiles, onMediaUpload, onRemoveMedia }: MediaUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateVideoDuration = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        if (video.duration > MAX_VIDEO_DURATION) {
          toast.error(`La vidéo dépasse 2min20. Durée: ${Math.floor(video.duration / 60)}:${String(Math.floor(video.duration % 60)).padStart(2, '0')}`);
          resolve(false);
        } else {
          resolve(true);
        }
      };
      video.onerror = () => {
        resolve(true); // Allow if can't read metadata
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validMediaFiles: MediaFile[] = [];
    
    for (const file of files) {
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith('image/') ? 'image' : 'video';
      
      if (type === 'video') {
        const isValid = await validateVideoDuration(file);
        if (!isValid) continue;
      }
      
      validMediaFiles.push({ file, url, type } as MediaFile);
    }
    
    if (validMediaFiles.length > 0) {
      onMediaUpload(validMediaFiles);
    }
    
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
          Add media
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
                  <video
                    src={media.url}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                    onMouseEnter={(e) => e.currentTarget.play()}
                    onMouseLeave={(e) => {
                      e.currentTarget.pause();
                      e.currentTarget.currentTime = 0;
                    }}
                  />
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