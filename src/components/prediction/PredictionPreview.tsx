
import React from 'react';
import { Card, CardContent, Button, Badge, Avatar, AvatarImage, AvatarFallback } from '@/ui';
import { AvatarFallback as ThemeAvatarFallback } from '@/components/ui/avatar-fallback';
import { X, Edit, TrendingUp, Zap } from 'lucide-react';
import type { PredictionPreview as PredictionPreviewType } from '@/types';
import { getConfidenceLevel } from '@/types/tip';
import { labelOf } from '@/utils/labels';
import { useOddsDisplay } from '@/shared/hooks/useOddsDisplay';

interface PredictionPreviewProps {
  prediction: PredictionPreviewType;
  onEdit: () => void;
  onRemove: () => void;
}

export function PredictionPreview({ prediction, onEdit, onRemove }: PredictionPreviewProps) {
  const { formattedOdds } = useOddsDisplay({ odds: prediction.odds });
  const TeamAvatar = ({ participant, index }: { participant: any; index: number }) => (
    <Avatar className="w-8 h-8 ring-2 ring-primary/20 shadow-sm">
      <AvatarImage 
        src={participant?.image} 
        alt={participant?.name || `Équipe ${index + 1}`}
      />
      <AvatarFallback asChild>
        <ThemeAvatarFallback 
          name={participant?.name || `Team ${index + 1}`}
          variant="team"
          size="sm"
        />
      </AvatarFallback>
    </Avatar>
  );

  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 bg-primary/20 rounded-full shadow-sm">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge className="bg-primary/20 text-primary border-primary/30 font-medium">
                  <Zap className="w-3 h-3 mr-1" />
                  Pronostic
                </Badge>
                <Badge variant="outline" className="text-xs bg-background/80">
                  {labelOf(prediction.sport, 'Sport')}
                </Badge>
                {prediction.confidence !== undefined && (
                  <Badge 
                    variant="secondary" 
                    className={`text-xs font-medium ${getConfidenceLevel(prediction.confidence).color} ${getConfidenceLevel(prediction.confidence).bgColor}`}
                  >
                    {prediction.confidence}% - {getConfidenceLevel(prediction.confidence).label}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-3 mb-3">
                {prediction.participants?.map((participant, index) => (
                  <React.Fragment key={index}>
                    <TeamAvatar participant={participant} index={index} />
                    {index === 0 && <span className="text-xs text-muted-foreground font-medium">vs</span>}
                  </React.Fragment>
                ))}
                <span className="font-semibold text-foreground">{prediction.matchTitle}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Prédiction:</span>
                  <span className="font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                    {prediction.predictionText}
                  </span>
                  <Badge variant="outline" className="font-mono bg-green-50 text-green-700 border-green-200">
                    {formattedOdds}
                  </Badge>
                </div>
                
                <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md inline-block">
                  {labelOf(prediction.league, 'Ligue inconnue')}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-9 w-9 p-0 hover:bg-primary/20 hover:text-primary rounded-full transition-all duration-200"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-9 w-9 p-0 hover:bg-destructive/20 hover:text-destructive rounded-full transition-all duration-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
