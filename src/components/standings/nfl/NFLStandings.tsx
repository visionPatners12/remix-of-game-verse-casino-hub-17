import { NFLStandingsTable } from './NFLStandingsTable';
import { NFLStanding } from '@/types/standings/nfl';

interface NFLStandingsProps {
  standings: NFLStanding[];
  loading?: boolean;
  error?: string | null;
}

export function NFLStandings({ standings, loading, error }: NFLStandingsProps) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Chargement du classement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!standings.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucun classement disponible</p>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-lg border border-border overflow-hidden">
      <NFLStandingsTable standings={standings} />
    </div>
  );
}
