import React from 'react';
import { Label } from '@/components/ui/label';
import { PostTypeSelector } from '../creation/PostTypeSelector';
import type { PostType } from '../../types/creation';

interface PostTypeSectionProps {
  selectedType: PostType;
  onTypeSelect: (type: PostType) => void;
  onRemovePrediction: () => void;
}

export function PostTypeSection({ selectedType, onTypeSelect, onRemovePrediction }: PostTypeSectionProps) {
  return (
    <div className="mb-6">
      <Label className="text-sm font-medium mb-3 block">Post type</Label>
      <PostTypeSelector
        selectedType={selectedType}
        onTypeSelect={(type) => {
          // Nettoyer les sélections quand on change de type
          if (selectedType !== type) {
            onRemovePrediction();
          }
          onTypeSelect(type);
        }}
      />
    </div>
  );
}