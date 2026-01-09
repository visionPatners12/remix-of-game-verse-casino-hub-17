import React from 'react';
import { Crown, Check } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { TipsterStats } from '@/types/tipster';
import { useIsMobile } from '@/hooks/use-mobile';
import { useOddsDisplay } from '@/shared/hooks/useOddsDisplay';
import { FollowButton } from '@/components/social/FollowButton';

interface TipsterRowProps {
  tipster: TipsterStats;
  onClick?: (tipster: TipsterStats) => void;
  index: number;
}

function getRankDisplay(rank: number) {
  if (rank === 1) return <span className="text-2xl">🥇</span>;
  if (rank === 2) return <span className="text-2xl">🥈</span>;
  if (rank === 3) return <span className="text-2xl">🥉</span>;
  return (
    <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
      <span className="text-sm font-semibold text-muted-foreground">{rank}</span>
    </div>
  );
}

export function TipsterRow({ tipster, onClick, index }: TipsterRowProps) {
  const isMobile = useIsMobile();
  const winRate = tipster.totalTips > 0 ? (tipster.wins / tipster.totalTips) * 100 : 0;
  const { formattedOdds: formattedAvgOdds } = useOddsDisplay({ odds: tipster.avgOdds });

  const handleClick = () => {
    onClick?.(tipster);
  };

  if (isMobile) {
    return (
      <div
        onClick={handleClick}
        className={`p-4 cursor-pointer transition-colors duration-200 hover:bg-muted/30 ${
          index % 2 === 0 ? 'bg-muted/10' : 'transparent'
        }`}
      >
        {/* Line 1: Rank + Avatar + Name + Button */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-shrink-0">{getRankDisplay(tipster.rank)}</div>
          <Avatar className="w-10 h-10 border-2 border-border/50">
            <AvatarImage src={tipster.avatar} alt={tipster.name} />
            <AvatarFallback>{tipster.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm truncate">{tipster.name}</span>
              {tipster.verified && (
                <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {tipster.followers.toLocaleString()} followers • Level {tipster.level}
            </p>
          </div>
          <FollowButton targetUserId={tipster.id} size="sm" className="flex-shrink-0 h-8 text-xs" />
        </div>

        {/* Line 2: Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Win%</div>
            <div className="text-sm font-bold">{tipster.winRate.toFixed(0)}%</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Tips</div>
            <div className="text-sm font-bold">{tipster.wins}/{tipster.totalTips}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Odds</div>
            <div className="text-sm font-bold">{formattedAvgOdds}</div>
          </div>
        </div>

        {/* Line 3: Form + Open */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {tipster.form.slice(-5).map((result, i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  result === 'W' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}
              >
                {result}
              </div>
            ))}
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{tipster.openTips}</span> open tips
          </div>
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div
      onClick={handleClick}
      className={`grid grid-cols-[60px_200px_1fr_1fr_1fr_120px_80px_80px] gap-4 px-4 md:px-6 py-3 cursor-pointer transition-colors duration-200 hover:bg-muted/30 ${
        index % 2 === 0 ? 'bg-muted/10' : 'transparent'
      }`}
    >
      {/* Rank */}
      <div className="flex items-center justify-center">
        {getRankDisplay(tipster.rank)}
      </div>

      {/* Avatar + Name */}
      <div className="flex items-center gap-2">
        <Avatar className="w-10 h-10 border-2 border-border/50">
          <AvatarImage src={tipster.avatar} alt={tipster.name} />
          <AvatarFallback>{tipster.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-sm truncate">{tipster.name}</span>
            {tipster.verified && (
              <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {tipster.followers.toLocaleString()} followers
          </p>
        </div>
      </div>

      {/* Win Rate */}
      <div className="flex items-center justify-center">
        <span className="text-sm font-medium">{tipster.winRate.toFixed(0)}%</span>
      </div>

      {/* Tips (won/total) */}
      <div className="flex items-center justify-center">
        <span className="text-sm font-medium">{tipster.wins}/{tipster.totalTips}</span>
      </div>

      {/* Avg Odds */}
      <div className="flex items-center justify-center">
        <span className="text-sm font-medium">{formattedAvgOdds}</span>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center gap-1">
        {tipster.form.slice(-5).map((result, i) => (
          <div
            key={i}
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
              result === 'W' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {result}
          </div>
        ))}
      </div>

      {/* Open Tips */}
      <div className="flex items-center justify-center">
        <span className="text-sm font-bold">{tipster.openTips}</span>
      </div>

      {/* Action */}
      <div className="flex items-center justify-center">
        <FollowButton targetUserId={tipster.id} size="sm" className="h-8 text-xs" />
      </div>
    </div>
  );
}
