import { useRugbyStandings } from '@/hooks/standings/useRugbyStandings';
import { RugbyStandingsTable } from './RugbyStandingsTable';

interface RugbyStandingsProps {
  leagueId: string;
}

export function RugbyStandings({ leagueId }: RugbyStandingsProps) {
  const { data: standings, isLoading, error } = useRugbyStandings(leagueId);

  if (isLoading) {
    return <div className="text-center py-8">Loading standings...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-destructive">Error loading standings</div>;
  }

  if (!standings || standings.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No standings available</div>;
  }

  return <RugbyStandingsTable standings={standings} />;
}
