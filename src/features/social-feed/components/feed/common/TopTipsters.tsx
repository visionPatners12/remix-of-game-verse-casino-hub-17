import React from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage, Badge, Card, CardContent, Button, Skeleton } from '@/ui';
import { Crown, TrendingUp, Star, ArrowRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { useLeaderboardData } from '@/features/tipster/hooks/useLeaderboardData';
import { useOddsDisplay } from '@/shared/hooks/useOddsDisplay';

// Helper component for formatted odds display
function FormattedOdds({ odds }: { odds: number }) {
  const { formattedOdds } = useOddsDisplay({ odds });
  return <>{formattedOdds}</>;
}

export function TopTipsters() {
  const { t } = useTranslation('feed');
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { data: tipsters, isLoading, error } = useLeaderboardData('all', 'all');
  
  const topTipsters = tipsters?.slice(0, 4) || [];

  // Handle network error gracefully - don't crash, just don't show the section
  if (error || (!isLoading && !tipsters)) {
    return null;
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 2:
        return <TrendingUp className="h-4 w-4 text-gray-400" />;
      case 3:
        return <Star className="h-4 w-4 text-amber-600" />;
      default:
        return <span className="text-xs font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'border-yellow-500/20 bg-yellow-500/5';
      case 2:
        return 'border-gray-400/20 bg-gray-400/5';
      case 3:
        return 'border-amber-600/20 bg-amber-600/5';
      default:
        return 'border-border bg-background';
    }
  };


  const renderFormBadges = (form: ('W' | 'L')[]) => {
    return form.slice(0, 5).map((result, i) => (
      <span
        key={i}
        className={`w-4 h-4 text-[10px] font-bold flex items-center justify-center rounded ${
          result === 'W' 
            ? 'bg-green-500/20 text-green-500' 
            : 'bg-red-500/20 text-red-500'
        }`}
      >
        {result}
      </span>
    ));
  };

  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">{t('tipsters.title')}</h2>
          </div>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">{t('tipsters.title')}</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/tipster-leaderboard')}
            className="text-primary hover:text-primary/80"
          >
            {t('tipsters.seeAll')}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide carousel-snap">
          {topTipsters.map((tipster) => (
            <div
              key={tipster.id}
              onClick={() => navigate(`/user/${tipster.username || tipster.id}`)}
              className={`flex-shrink-0 w-28 p-2 rounded-lg border cursor-pointer transition-all active:scale-95 ${getRankColor(tipster.rank)}`}
              style={{ minHeight: '44px', touchAction: 'manipulation' }}
            >
              <div className="flex flex-col items-center space-y-1.5">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={tipster.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${tipster.name}`} />
                    <AvatarFallback className="text-xs">{tipster.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-0.5 -right-0.5 flex items-center justify-center">
                    {getRankIcon(tipster.rank)}
                  </div>
                </div>
                
                <div className="text-center w-full space-y-0.5">
                  <p className="text-xs font-medium truncate">{tipster.name}</p>
                  <div className="flex gap-0.5 justify-center">
                    {renderFormBadges(tipster.form)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Crown className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">{t('tipsters.title')}</h2>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {t('tipsters.top4')}
          </Badge>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/tipster-leaderboard')}
          className="flex items-center gap-2"
        >
          {t('tipsters.viewRankings')}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3">
        {topTipsters.map((tipster) => (
          <Card
            key={tipster.id}
            onClick={() => navigate(`/user/${tipster.username || tipster.id}`)}
            className={`cursor-pointer transition-all hover:shadow-md group ${getRankColor(tipster.rank)}`}
          >
            <CardContent className="p-3" style={{ minHeight: '44px', touchAction: 'manipulation' }}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={tipster.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${tipster.name}`} />
                      <AvatarFallback className="text-xs">{tipster.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <h3 className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                        {tipster.name}
                      </h3>
                      {getRankIcon(tipster.rank)}
                    </div>
                    <p className="text-xs text-muted-foreground">{tipster.totalTips} {t('tipsters.tips')}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1.5">
                
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t('tipsters.winRate')}</span>
                  <span className="font-semibold">{tipster.winRate.toFixed(0)}%</span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t('tipsters.avgOdds')}</span>
                  <span className="font-semibold"><FormattedOdds odds={tipster.avgOdds} /></span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">{t('tipsters.form')}</span>
                  <div className="flex gap-0.5">
                    {renderFormBadges(tipster.form)}
                  </div>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t('tipsters.open')}</span>
                  <span className="font-semibold">{tipster.openTips}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
