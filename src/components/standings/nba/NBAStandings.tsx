import { BasketballStanding } from '@/types/standings/basketball';
import { NBAStandingsTable } from './NBAStandingsTable';
import { StandingsSkeletonLoader } from '@/components/ui/skeleton-loader';

interface NBAStandingsProps {
  standings: BasketballStanding[];
  loading?: boolean;
  error?: string | null;
}

export function NBAStandings({ standings, loading, error }: NBAStandingsProps) {
  if (loading) {
    return <StandingsSkeletonLoader />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!standings.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No standings available</p>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-lg border border-border overflow-hidden">
      <NBAStandingsTable standings={standings} />
    </div>
  );
}
