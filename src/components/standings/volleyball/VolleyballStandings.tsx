import { useVolleyballStandings } from '@/hooks/standings/useVolleyballStandings';
import { VolleyballStandingsTable } from './VolleyballStandingsTable';

interface VolleyballStandingsProps {
  leagueId: string;
}

export function VolleyballStandings({ leagueId }: VolleyballStandingsProps) {
  const { data: standings, isLoading, error } = useVolleyballStandings(leagueId);

  if (isLoading) {
    return <div className="text-center py-8">Loading standings...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-destructive">Error loading standings</div>;
  }

  if (!standings || standings.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No standings available</div>;
  }

  return <VolleyballStandingsTable standings={standings} />;
}
