import React from 'react';
import { Button } from '@/components/ui/button';

interface SubmitSectionProps {
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export function SubmitSection({ canSubmit, isSubmitting, onSubmit }: SubmitSectionProps) {
  return (
    <div className="fixed bottom-0 md:bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-20 mb-16 md:mb-0">
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