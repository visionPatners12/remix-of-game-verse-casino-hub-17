import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui';
import { Badge } from '@/ui';
import { Button } from '@/ui';
import { TipsterStats, TipsterCardProps } from '@/types/tipster';
import { useOddsDisplay } from '@/shared/hooks/useOddsDisplay';
import { 
  Trophy, 
  Star, 
  TrendingUp, 
  Target,
  Users,
  ArrowUpDown,
  Medal,
  Zap
} from 'lucide-react';

// Helper function to get rank display
const getRankDisplay = (rank: number) => {
  if (rank === 1) return <span className="text-xl">🥇</span>;
  if (rank === 2) return <span className="text-xl">🥈</span>;
  if (rank === 3) return <span className="text-xl">🥉</span>;
  return (
    <Badge variant="secondary" className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
      {rank}
    </Badge>
  );
};

// Helper function to render form
const renderForm = (form: ('W' | 'L')[]) => {
  return (
    <div className="flex gap-1">
      {form.slice(-5).map((result, index) => (
        <div
          key={index}
          className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold",
            result === 'W' 
              ? "bg-green-500/20 text-green-400 border border-green-500/30" 
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          )}
        >
          {result}
        </div>
      ))}
    </div>
  );
};

export function TipsterCard({ tipster, onClick, variant = 'horizontal', className }: TipsterCardProps) {
  const { formattedOdds: formattedAvgOdds } = useOddsDisplay({ odds: tipster.avgOdds });

  if (variant === 'horizontal') {
    return (
      <Card 
        className={cn(
          "group relative overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:border-border transition-all duration-300 cursor-pointer hover:shadow-lg",
          className
        )}
        onClick={() => onClick?.(tipster)}
      >
        <CardContent className="p-0">
          {/* Mobile Layout - Stacked */}
          <div className="flex flex-col sm:hidden p-4 space-y-4">
            {/* Header Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarImage src={tipster.avatar} alt={tipster.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {tipster.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {tipster.verified && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Star className="w-3 h-3 text-white fill-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {getRankDisplay(tipster.rank)}
                    <h3 className="font-semibold text-foreground truncate">{tipster.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {tipster.followers}
                    </span>
                    <span>•</span>
                    <span>Niveau {tipster.level}</span>
                  </div>
                </div>
              </div>
              <Button size="sm" variant="default" className="h-8">
                Follow
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-secondary">{tipster.winRate.toFixed(0)}%</div>
                <div className="text-xs text-muted-foreground">Win Rate</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">{tipster.wins}/{tipster.totalTips}</div>
                <div className="text-xs text-muted-foreground">Tips</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-accent">{formattedAvgOdds}</div>
                <div className="text-xs text-muted-foreground">Avg. Odds</div>
              </div>
            </div>

            {/* Form */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Form</div>
                {renderForm(tipster.form)}
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">{tipster.openTips} open tips</div>
              </div>
            </div>
          </div>

          {/* Desktop Layout - Single Row */}
          <div className="hidden sm:flex items-center p-4 gap-4">
            {/* Rank & Avatar */}
            <div className="flex items-center gap-3 min-w-[160px]">
              {getRankDisplay(tipster.rank)}
              <div className="relative">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarImage src={tipster.avatar} alt={tipster.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {tipster.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {tipster.verified && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <Star className="w-2.5 h-2.5 text-white fill-white" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground truncate">{tipster.name}</h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  <span>{tipster.followers}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 grid grid-cols-3 gap-4 min-w-[300px]">
              <div className="text-center">
                <div className="text-sm font-bold text-secondary">{tipster.winRate.toFixed(0)}%</div>
                <div className="text-xs text-muted-foreground">Win Rate</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-foreground">{tipster.wins}/{tipster.totalTips}</div>
                <div className="text-xs text-muted-foreground">Tips</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-accent">{formattedAvgOdds}</div>
                <div className="text-xs text-muted-foreground">Avg. Odds</div>
              </div>
            </div>

            {/* Form & Actions */}
            <div className="flex items-center gap-4 min-w-[180px]">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Form</div>
                {renderForm(tipster.form)}
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-xs text-muted-foreground text-right">{tipster.openTips} open tips</div>
                <Button size="sm" variant="default" className="h-7 text-xs">
                  Follow
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default/Stacked variant
  return (
    <Card 
      className={cn(
        "group relative overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:border-border transition-all duration-300 cursor-pointer hover:shadow-lg",
        className
      )}
      onClick={() => onClick?.(tipster)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarImage src={tipster.avatar} alt={tipster.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {tipster.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{tipster.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {getRankDisplay(tipster.rank)}
              <span>#{tipster.rank}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center">
          <div>
            <div className="text-sm font-bold text-foreground">{tipster.winRate.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">Win Rate</div>
          </div>
          <div>
            <div className="text-sm font-bold text-secondary">{tipster.wins}/{tipster.totalTips}</div>
            <div className="text-xs text-muted-foreground">Tips</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}