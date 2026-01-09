import React from 'react';
import { ChevronLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FocusBreadcrumbProps {
  onBack: () => void;
}

export function FocusBreadcrumb({ onBack }: FocusBreadcrumbProps) {
  return (
    <div className="px-6 py-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-2 hover:bg-muted/80 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to feed</span>
        </Button>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>/</span>
          <Home className="h-3.5 w-3.5" />
          <span>/</span>
          <span className="font-medium">Post</span>
        </div>
      </div>
    </div>
  );
}
