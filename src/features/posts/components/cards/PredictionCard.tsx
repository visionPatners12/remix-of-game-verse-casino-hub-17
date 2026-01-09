import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { AddToTicketButton } from '@/features/social-feed/components/shared/AddToTicketButton';
import { TeamLink } from '@/features/social-feed/components/shared/TeamLink';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useOddsDisplay } from '@/shared/hooks/useOddsDisplay';
import type { PredictionWithSelections } from '../../services/PredictionService';

// Helper component for formatted odds
function FormattedOdds({ odds, className }: { odds: number; className?: string }) {
  const { formattedOdds } = useOddsDisplay({ odds });
  return <span className={className}>{formattedOdds}</span>;
}

interface PredictionCardProps {
  prediction: PredictionWithSelections;
}

export function PredictionCard({ prediction }: PredictionCardProps) {
  const totalOdds = prediction.selections.reduce((acc, sel) => acc * sel.odds, 1);
  const isParlay = prediction.selections.length > 1;
  const confidencePercent = prediction.confidence * 20; // 1-5 → 0-100
  
  const formatTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
    } catch {
      return 'Il y a quelques instants';
    }
  };
  
  const getConfidenceColor = (percent: number) => {
    if (percent >= 80) return 'hsl(var(--chart-2))'; // Green
    if (percent >= 60) return 'hsl(var(--chart-3))'; // Orange
    return 'hsl(var(--destructive))'; // Red
  };
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-4">
        {/* Header avec auteur */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={prediction.user.avatar_url} alt={prediction.user.username} />
            <AvatarFallback>{prediction.user.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-sm">{prediction.user.username}</p>
            <p className="text-xs text-muted-foreground">
              {formatTimeAgo(prediction.created_at)}
            </p>
          </div>
        </div>
        
        {/* Confidence bar */}
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-muted-foreground font-medium">CONFIDENCE</span>
            <span className="font-bold">{confidencePercent}%</span>
          </div>
          <div className="w-full bg-muted/30 rounded-full h-2">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${confidencePercent}%`,
                backgroundColor: getConfidenceColor(confidencePercent)
              }}
            />
          </div>
        </div>
        
        {/* Selections */}
        <div className="space-y-2">
          {isParlay && (
            <div className="text-xs font-medium text-muted-foreground uppercase">
              {prediction.selections.length} SELECTIONS • PARLAY
            </div>
          )}
          
          {prediction.selections.map((sel) => (
            <div key={sel.id} className="bg-muted/30 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm flex-wrap">
                {sel.match.homeImage && (
                  <img src={sel.match.homeImage} alt="" className="w-5 h-5 rounded-full object-cover" />
                )}
                <TeamLink teamName={sel.match.homeName} className="font-medium">
                  {sel.match.homeName}
                </TeamLink>
                <span className="text-muted-foreground">vs</span>
                {sel.match.awayImage && (
                  <img src={sel.match.awayImage} alt="" className="w-5 h-5 rounded-full object-cover" />
                )}
                <TeamLink teamName={sel.match.awayName} className="font-medium">
                  {sel.match.awayName}
                </TeamLink>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground uppercase">
                  {sel.market_type} • {sel.pick}
                </span>
                <FormattedOdds odds={sel.odds} className="text-sm font-bold text-primary" />
              </div>
            </div>
          ))}
          
          {isParlay && (
            <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-primary uppercase">COTE TOTALE</span>
                <FormattedOdds odds={totalOdds} className="text-lg font-bold text-primary" />
              </div>
            </div>
          )}
        </div>
        
        {/* Analysis */}
        {prediction.analysis && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Analyse</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{prediction.analysis}</p>
          </div>
        )}
        
        {/* Actions - Only for single bets */}
        {!isParlay && prediction.selections[0] && (
          <div className="flex gap-2">
            <AddToTicketButton
              selection={{
                conditionId: prediction.selections[0].condition_id,
                outcomeId: prediction.selections[0].outcome_id,
                odds: prediction.selections[0].odds,
                marketType: prediction.selections[0].market_type,
                pick: prediction.selections[0].pick
              }}
              match={{
                id: prediction.selections[0].match.id || undefined,
                homeName: prediction.selections[0].match.homeName,
                awayName: prediction.selections[0].match.awayName,
                date: prediction.selections[0].match.date,
                league: {
                  name: prediction.selections[0].match.league,
                  slug: ''
                },
                sport: {
                  name: prediction.selections[0].match.sport,
                  slug: ''
                }
              }}
              className="flex-1"
            />
          </div>
        )}
        
        {/* Hashtags */}
        {prediction.hashtags && prediction.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {prediction.hashtags.map((tag, i) => (
              <span key={i} className="text-xs text-primary hover:text-primary/80 transition-colors cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
