import React from 'react';
import { Button } from '@/components/ui/button';

interface SubmitSectionProps {
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export function SubmitSection({ canSubmit, isSubmitting, onSubmit }: SubmitSectionProps) {
  return (
    <div 
      className="fixed left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t border-border p-4 z-40"
      style={{ bottom: 'var(--safe-area-inset-bottom, 0px)' }}
    >
      <Button
        onClick={onSubmit}
        disabled={!canSubmit || isSubmitting}
        className="w-full h-14 text-base font-semibold rounded-2xl bg-primary hover:bg-primary/90 shadow-lg"
      >
        {isSubmitting ? 'Publishing...' : 'Publish'}
      </Button>
    </div>
  );
}