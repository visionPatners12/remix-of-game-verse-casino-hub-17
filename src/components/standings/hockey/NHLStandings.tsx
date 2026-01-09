import { HockeyStanding } from '@/types/standings/hockey';
import { NHLStandingsTable } from './NHLStandingsTable';
import { StandingsSkeletonLoader } from '@/components/ui/skeleton-loader';

interface NHLStandingsProps {
  standings: HockeyStanding[];
  loading?: boolean;
  error?: Error | null;
}

export function NHLStandings({ standings, loading, error }: NHLStandingsProps) {
  if (loading) {
    return <StandingsSkeletonLoader />;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        Error loading standings
      </div>
    );
  }

  if (!standings || standings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No standings available
      </div>
    );
  }

  return (
    <div className="bg-background rounded-lg border border-border overflow-hidden">
      <NHLStandingsTable standings={standings} />
    </div>
  );
}
