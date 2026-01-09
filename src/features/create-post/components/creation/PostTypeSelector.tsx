import React from 'react';
import { POST_TYPES } from '../../constants';
import type { PostType } from '../../types/creation';

interface PostTypeSelectorProps {
  selectedType: PostType;
  onTypeSelect: (type: PostType) => void;
}

export function PostTypeSelector({ selectedType, onTypeSelect }: PostTypeSelectorProps) {
  return (
    <div className="flex gap-2">
      {POST_TYPES.map((type) => (
        <button 
          key={type.id}
          onClick={() => onTypeSelect(type.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selectedType === type.id 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'bg-muted hover:bg-muted/80 text-muted-foreground'
          }`}
        >
          {type.icon}
          <span>{type.title}</span>
        </button>
      ))}
    </div>
  );
}
