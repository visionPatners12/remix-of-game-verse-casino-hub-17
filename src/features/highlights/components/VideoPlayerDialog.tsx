import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Highlight } from '../types';

interface VideoPlayerDialogProps {
  highlight: Highlight;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VideoPlayerDialog({ highlight, open, onOpenChange }: VideoPlayerDialogProps) {
  const videoUrl = highlight.embed_url || highlight.video_url;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{highlight.title || 'Highlight'}</DialogTitle>
        </DialogHeader>
        
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
          {videoUrl ? (
            highlight.embed_url ? (
              <iframe
                src={highlight.embed_url}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={highlight.video_url!}
                className="h-full w-full"
                controls
              />
            )
          ) : (
            <div className="flex h-full items-center justify-center text-white">
              Vidéo non disponible
            </div>
          )}
        </div>

        {highlight.description && (
          <p className="text-sm text-muted-foreground">{highlight.description}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
