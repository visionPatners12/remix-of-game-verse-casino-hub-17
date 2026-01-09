import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { PostType } from '../../types/creation';
import { TicketSelectionsDisplay } from './TicketSelectionsDisplay';

interface ContentSectionProps {
  content: string;
  onContentChange: (content: string) => void;
  selectedType: PostType;
  selectedConfig: any;
  selectedPrediction?: any;
  selectedMatch?: any;
  confidence?: number;
  onConfidenceChange?: (value: number) => void;
}

export function ContentSection({ 
  content, 
  onContentChange, 
  selectedType, 
  selectedConfig, 
  selectedPrediction, 
  selectedMatch,
  confidence = 50,
  onConfidenceChange
}: ContentSectionProps) {
  return (
    <div className="space-y-4">
      {selectedType === 'prediction' && (
        <TicketSelectionsDisplay 
          showConfidence={true}
          confidence={confidence}
          onConfidenceChange={onConfidenceChange}
        />
      )}
      <div className="mb-6">
        <Label htmlFor="content" className="text-sm font-medium mb-3 block">
          {selectedConfig.title}
          {selectedType === 'prediction' && !selectedPrediction && (
            <span className="text-destructive ml-1">*</span>
          )}
          {selectedType === 'opinion' && !selectedMatch && (
            <span className="text-destructive ml-1">*</span>
          )}
        </Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder={selectedConfig.placeholder}
          className="min-h-32 text-base resize-none rounded-2xl border-2 focus:border-primary"
          maxLength={500}
        />
        <div className="flex justify-between items-center mt-2">
          <div className="text-xs text-muted-foreground">
            {content.length}/500 characters
          </div>
        </div>
      </div>
    </div>
  );
}