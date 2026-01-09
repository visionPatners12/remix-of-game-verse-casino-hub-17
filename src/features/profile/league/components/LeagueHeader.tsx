import { useTranslation } from 'react-i18next';
import { LeagueProfile } from '@/types/league';
import { useLeagueStandings } from '@/hooks/standings/useLeagueStandings';
import { useEntityFollow } from '@/hooks/useEntityFollow';
import { useSupabaseGames } from '@/features/sports/hooks/useSupabaseGames';
import { useMemo } from 'react';
import { Avatar, AvatarImage, AvatarFallback, Button } from '@/ui';
import { CountryFlag } from '@/components/ui/country-flag';
import { SportIcon } from '@/components/ui/sport-icon';
import { Star } from 'lucide-react';
import { formatNumber } from '@/utils/formatters';

interface LeagueHeaderProps {
  league: LeagueProfile;
}

export function LeagueHeader({ league }: LeagueHeaderProps) {
  const { t } = useTranslation('pages');
  
  // Fetch upcoming matches from stg_azuro_games (same source as Matches tab)
  const { data: upcomingMatches = [] } = useSupabaseGames({
    leagueId: league.id,
    timeFilter: 'upcoming',
    limit: 100,
  });
  
  const { data: standings } = useLeagueStandings(league.id);
  const { isFollowing, followersCount, toggleFollow, isToggling, isLoading } = useEntityFollow({
    entityType: 'league',
    leagueId: league.id
  });

  const upcomingCount = upcomingMatches.length;

  // Count unique teams from standings (handles multiple stages)
  const teamsCount = useMemo(() => {
    if (!standings || standings.length === 0) return 20; // Default value
    const uniqueTeamIds = new Set(standings.map(s => s.team.id));
    return uniqueTeamIds.size;
  }, [standings]);

  return (
    <div className="px-4 py-3">
      {/* Header with avatar and info - Instagram Style */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <Avatar className="w-20 h-20 ring-2 ring-border/50">
            <AvatarImage src={league.logo_url} alt={league.name} className="object-contain p-2" />
            <AvatarFallback className="text-xl font-bold bg-muted text-muted-foreground">
              {league.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <div className="flex-1 min-w-0">
          {/* League name */}
          <div className="mb-2">
            <h1 className="text-base font-semibold text-foreground truncate">
              {league.name}
            </h1>
          </div>

          {/* Stats in horizontal line */}
          <div className="flex items-center gap-6 mb-3">
            <div className="text-left">
              <div className="font-semibold text-foreground text-sm">{upcomingCount}</div>
              <div className="text-xs text-muted-foreground">{t('league.header.upcoming')}</div>
            </div>
            <div className="text-left">
              <div className="font-semibold text-foreground text-sm">{teamsCount}</div>
              <div className="text-xs text-muted-foreground">{t('league.header.teams')}</div>
            </div>
            <div className="text-left">
              <div className="font-semibold text-foreground text-sm">{formatNumber(followersCount)}</div>
              <div className="text-xs text-muted-foreground">{t('league.header.followers')}</div>
            </div>
          </div>

          {/* Follow and favorite buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={() => toggleFollow()}
              disabled={isToggling || isLoading}
              variant={isFollowing ? "outline" : "default"}
              className="h-7 px-4 text-xs font-medium flex-1"
            >
              {isToggling ? '...' : isFollowing ? t('league.header.unfollow') : t('league.header.follow')}
            </Button>
            <Button 
              variant="outline"
              className="h-7 px-3 text-xs font-medium"
              aria-label="Add to favorites"
            >
              <Star size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
