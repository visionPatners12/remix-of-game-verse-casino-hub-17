import { LeagueProfile } from '@/types/league';
import { useSupabaseGames } from '@/features/sports/hooks/useSupabaseGames';
import { FixturesSkeletonLoader } from '@/components/ui/skeleton-loader';
import { LeagueMatchCard } from './LeagueMatchCard';
import { useMatchNavigation } from '@/hooks/useMatchNavigation';

interface LeagueFixturesProps {
  league: LeagueProfile;
  type: 'upcoming' | 'past';
}

export function LeagueFixtures({ league, type }: LeagueFixturesProps) {
  const { navigateToMatch } = useMatchNavigation();
  
  // Use useSupabaseGames with timeFilter - same hook as MLB/other sports
  const { data: matches, isLoading, error } = useSupabaseGames({
    leagueId: league.id,
    timeFilter: type === 'upcoming' ? 'upcoming' : 'past',
    limit: 200,
    orderDirection: type === 'upcoming' ? 'asc' : 'desc',
  });

  const handleMatchClick = (match: any) => {
    navigateToMatch({
      id: match.id,
      home_name: match.participants?.[0]?.name,
      away_name: match.participants?.[1]?.name,
      league_slug: match.league?.slug,
      league_name: match.league?.name,
      sport_slug: match.sport?.slug,
      sport_name: match.sport?.name,
    });
  };

  if (isLoading) {
    return <FixturesSkeletonLoader />;
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading matches</p>
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          {type === 'upcoming' ? 'No upcoming matches' : 'No past matches'}
        </p>
      </div>
    );
  }

  // Transform to LeagueMatchCard expected format
  const transformedMatches = matches.map((m: any) => ({
    id: m.id,
    startsAt: new Date(parseInt(m.startsAt) * 1000).toISOString(),
    status_long: m.state === 'Prematch' ? 'Not Started' : m.state,
    sport: m.sport,
    league: m.league,
    participants: m.participants,
    gameId: m.gameId,
    azuro_game_id: m.gameId,
    is_live: m.state === 'Live',
    is_prematch: m.state === 'Prematch',
    states: m.matchStates ?? null,
  }));

  return (
    <div className="px-3 pb-4 space-y-3">
      {matches.map((match: any) => (
        <LeagueMatchCard
          key={match.id}
          match={match}
          onClick={() => handleMatchClick(match)}
        />
      ))}
    </div>
  );
}
