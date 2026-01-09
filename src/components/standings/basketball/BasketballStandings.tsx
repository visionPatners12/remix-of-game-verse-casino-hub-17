import { BasketballStandingsTable } from './BasketballStandingsTable';
import { StandingsSkeletonLoader } from '@/components/ui/skeleton-loader';
import { useBasketballStandings } from '@/hooks/standings/useBasketballStandings';

interface BasketballStandingsProps {
  leagueId: string;
}

export function BasketballStandings({ leagueId }: BasketballStandingsProps) {
  const { data: standings, isLoading, error } = useBasketballStandings(leagueId);

  if (isLoading) {
    return <StandingsSkeletonLoader />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Error loading standings</p>
      </div>
    );
  }

  if (!standings || standings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No standings available</p>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-lg border border-border overflow-hidden">
      <BasketballStandingsTable standings={standings} />
    </div>
  );
}
