/**
 * @deprecated This component is deprecated and will be removed in a future version.
 * The match/market selection flow is being replaced with a new system.
 */
import React from 'react';
import { Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { labelOf } from '@/utils/labels';

interface OpinionSectionProps {
  selectedMatch: any;
  onOpenPredictionDialog: () => void;
  onEditPrediction: () => void;
  onRemovePrediction: () => void;
}

export function OpinionSection({ 
  selectedMatch, 
  onOpenPredictionDialog,
  onEditPrediction,
  onRemovePrediction 
}: OpinionSectionProps) {
  return (
    <div className="mb-6">
      <Label className="text-sm font-medium mb-3 block">
        Match (optional)
      </Label>
      
      {selectedMatch ? (
        <div className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-xl p-4 flex items-center justify-between">
          <div>
            <h3 className="font-medium text-base mb-1">{selectedMatch.matchTitle}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{labelOf(selectedMatch.sport, 'Sport')}</span>
              <span>•</span>
              <span>{labelOf(selectedMatch.league, 'Unknown league')}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEditPrediction}
              className="text-muted-foreground hover:text-foreground"
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemovePrediction}
              className="text-muted-foreground hover:text-destructive"
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={onOpenPredictionDialog}
          variant="outline"
          className="w-full h-auto p-4 rounded-2xl border-2 border-dashed hover:border-primary"
        >
          <div className="flex flex-col items-center gap-2">
            <Plus className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Associate with a match</span>
            <span className="text-xs text-muted-foreground">
              Optional - Link your opinion to a specific match
            </span>
            <Badge variant="secondary" className="text-xs">
              Optional
            </Badge>
          </div>
        </Button>
      )}
    </div>
  );
}