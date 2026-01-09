import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { POST_TYPES } from '../../constants';
import type { PostType } from '../../types/creation';

interface PostTypeSelectorProps {
  selectedType: PostType;
  onTypeSelect: (type: PostType) => void;
}

export function PostTypeSelector({ selectedType, onTypeSelect }: PostTypeSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2 p-4">
      {POST_TYPES.map((type) => (
        <Card 
          key={type.id}
          className={`cursor-pointer transition-all border ${
            selectedType === type.id 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50'
          }`}
          onClick={() => onTypeSelect(type.id)}
        >
          <CardContent className="p-3 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className={`${selectedType === type.id ? 'text-primary' : 'text-muted-foreground'}`}>
                {type.icon}
              </div>
              <div>
                <h3 className="font-medium text-sm">{type.title}</h3>
                <p className="text-xs text-muted-foreground">{type.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}