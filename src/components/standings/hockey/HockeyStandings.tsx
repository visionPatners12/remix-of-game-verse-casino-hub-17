import { useHockeyStandings } from '@/hooks/standings/useHockeyStandings';
import { HockeyStandingsTable } from './HockeyStandingsTable';

interface HockeyStandingsProps {
  leagueId: string;
}

export function HockeyStandings({ leagueId }: HockeyStandingsProps) {
  const { data: standings, isLoading, error } = useHockeyStandings(leagueId);

  if (isLoading) {
    return <div className="text-center py-8">Loading standings...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-destructive">Error loading standings</div>;
  }

  if (!standings || standings.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No standings available</div>;
  }

  return <HockeyStandingsTable standings={standings} />;
}
