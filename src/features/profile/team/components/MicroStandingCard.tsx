import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, ExternalLink } from 'lucide-react';
import { FootballApiStanding } from '@/types/footballApi';

interface MicroStandingCardProps {
  standing: FootballApiStanding | null;
  onViewFullStandings?: () => void;
}

export function MicroStandingCard({ standing, onViewFullStandings }: MicroStandingCardProps) {
  if (!standing) {
    return (
      <Card className="bg-card border">
        <CardContent className="p-grid-4 text-center">
          <div className="text-muted-foreground text-body">
            Standings not available
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPositionColor = (rank: number) => {
    if (rank <= 4) return 'text-success'; // Champions League / Top positions
    if (rank <= 6) return 'text-warning'; // Europa League
    if (rank >= 18) return 'text-error'; // Relegation zone (for most leagues)
    return 'text-foreground';
  };

  const getPositionBadgeVariant = (rank: number) => {
    if (rank <= 4) return 'default';
    if (rank <= 6) return 'secondary';
    if (rank >= 18) return 'destructive';
    return 'outline';
  };

  return (
    <Card className="bg-card border hover:shadow-soft transition-all">
      <CardContent className="p-grid-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge 
              variant={getPositionBadgeVariant(standing.rank)}
              className="w-8 h-8 rounded-full flex items-center justify-center p-0 text-caption font-bold"
            >
              {standing.rank}
            </Badge>
            
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber" />
                <span className="text-subtitle font-semibold">
                  {standing.rank}{standing.rank === 1 ? 'er' : 'e'} • {standing.points} pts
                </span>
              </div>
              
              <div className="flex items-center gap-4 mt-1 text-caption text-muted-foreground">
                <span>{standing.all.win}V</span>
                <span>{standing.all.draw}N</span>
                <span>{standing.all.lose}D</span>
                <span className={`font-medium ${
                  standing.goalsDiff > 0 ? 'text-success' : 
                  standing.goalsDiff < 0 ? 'text-error' : 'text-muted-foreground'
                }`}>
                  {standing.goalsDiff > 0 ? '+' : ''}{standing.goalsDiff}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            {/* Form Pills */}
            <div className="flex gap-1 mb-2 justify-end">
              {standing.form.split('').slice(-5).map((result, index) => (
                <div
                  key={index}
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    result === 'W' ? 'bg-success text-success-foreground' :
                    result === 'D' ? 'bg-warning text-warning-foreground' :
                    'bg-error text-error-foreground'
                  }`}
                >
                  {result === 'W' ? 'V' : result === 'D' ? 'N' : 'D'}
                </div>
              ))}
            </div>
            
            <Button
              onClick={onViewFullStandings}
              variant="outline"
              size="sm"
              className="text-caption"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View standings
            </Button>
          </div>
        </div>

        {/* Status Description */}
        {standing.description && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center gap-2 text-caption">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">{standing.description}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}