/**
 * @deprecated This component is deprecated and will be removed in a future version.
 * The match/market selection flow is being replaced with a new system.
 */
import React from 'react';
import { Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PredictionPreview } from '@/components/prediction/PredictionPreview';

interface PredictionSectionProps {
  selectedPrediction: any;
  isPremiumTip: boolean;
  onOpenPredictionDialog: () => void;
  onEditPrediction: () => void;
  onRemovePrediction: () => void;
}

export function PredictionSection({ 
  selectedPrediction, 
  isPremiumTip, 
  onOpenPredictionDialog,
  onEditPrediction,
  onRemovePrediction 
}: PredictionSectionProps) {
  return (
    <div className="mb-6">
      <Label className="text-sm font-medium mb-3 block">
        {isPremiumTip ? 'Market for premium tip' : 'Market to predict'} <span className="text-destructive">*</span>
      </Label>
      
      {selectedPrediction ? (
        <PredictionPreview
          prediction={selectedPrediction}
          onEdit={onEditPrediction}
          onRemove={onRemovePrediction}
        />
      ) : (
        <Button
          onClick={onOpenPredictionDialog}
          variant="outline"
          className="w-full h-auto p-4 rounded-2xl border-2 border-dashed hover:border-primary"
        >
          <div className="flex flex-col items-center gap-2">
            <Plus className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Choose a market</span>
             <span className="text-xs text-muted-foreground">
               {isPremiumTip 
                 ? 'Select a market for your premium tip'
                 : 'Select a market and make your prediction'
               }
            </span>
            <Badge variant="destructive" className="text-xs">
              Required
            </Badge>
          </div>
        </Button>
      )}
    </div>
  );
}