import { useHandballStandings } from '@/hooks/standings/useHandballStandings';
import { HandballStandingsTable } from './HandballStandingsTable';

interface HandballStandingsProps {
  leagueId: string;
}

export function HandballStandings({ leagueId }: HandballStandingsProps) {
  const { data: standings, isLoading, error } = useHandballStandings(leagueId);

  if (isLoading) {
    return <div className="text-center py-8">Loading standings...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-destructive">Error loading standings</div>;
  }

  if (!standings || standings.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No standings available</div>;
  }

  return <HandballStandingsTable standings={standings} />;
}
