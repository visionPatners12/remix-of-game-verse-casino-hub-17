
import React, { useState, useEffect } from 'react';
import { Label, Input, Badge, Button } from '@/ui';
import { Hash, X, Plus } from 'lucide-react';
import { extractHashtags, validateHashtag, cleanHashtag, suggestHashtagsFromContent } from '@/utils/hashtagUtils';
import type { GamesQuery } from '@azuro-org/toolkit';

type AzuroGame = GamesQuery['games'][0];

interface HashtagsFieldProps {
  hashtags: string[];
  onChange: (hashtags: string[]) => void;
  selectedMatch?: AzuroGame | null;
  error?: string;
}

export function HashtagsField({ hashtags, onChange, selectedMatch, error }: HashtagsFieldProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Auto-générer les hashtags basés sur le match sélectionné
  useEffect(() => {
    if (selectedMatch) {
      const matchInfo = {
        teamA: selectedMatch.participants[0]?.name,
        teamB: selectedMatch.participants[1]?.name,
        league: selectedMatch.league?.name,
        sport: selectedMatch.sport?.name
      };

      const suggested = suggestHashtagsFromContent('', matchInfo);
      setSuggestions(suggested);

      // Auto-ajouter le hashtag du sport si pas déjà présent
      if (matchInfo.sport) {
        const sportHashtag = `#${cleanHashtag(matchInfo.sport)}`;
        if (!hashtags.includes(sportHashtag)) {
          onChange([...hashtags, sportHashtag]);
        }
      }
    }
  }, [selectedMatch, hashtags, onChange]);

  const addHashtag = (tag: string) => {
    const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
    if (validateHashtag(cleanTag) && !hashtags.includes(cleanTag)) {
      onChange([...hashtags, cleanTag]);
    }
  };

  const removeHashtag = (tagToRemove: string) => {
    onChange(hashtags.filter(tag => tag !== tagToRemove));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (inputValue.trim()) {
        addHashtag(inputValue.trim());
        setInputValue('');
      }
    }
  };

  const addSuggestion = (suggestion: string) => {
    addHashtag(suggestion);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium flex items-center gap-2">
        <Hash className="h-4 w-4" />
        Hashtags
      </Label>

      {/* Hashtags actuels */}
      {hashtags.length > 0 && (
        <div className="flex gap-2 overflow-hidden">
          {hashtags.map((tag, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="px-3 py-1 text-sm flex items-center gap-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeHashtag(tag)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input pour ajouter des hashtags */}
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Ajouter un hashtag..."
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            if (inputValue.trim()) {
              addHashtag(inputValue.trim());
              setInputValue('');
            }
          }}
          disabled={!inputValue.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Suggestions :</Label>
          <div className="flex gap-2 overflow-hidden">
            {suggestions
              .filter(suggestion => !hashtags.includes(suggestion))
              .slice(0, 6)
              .map((suggestion, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addSuggestion(suggestion)}
                  className="h-7 px-2 text-xs border border-dashed border-muted-foreground/30 hover:border-primary"
                >
                  {suggestion}
                </Button>
              ))}
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
