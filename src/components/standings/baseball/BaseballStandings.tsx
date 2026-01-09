import { BaseballStanding, BaseballStandingsGroup } from '@/types/standings/baseball';
import { BaseballStandingsTable } from './BaseballStandingsTable';
import { BaseballStandingsMobile } from './BaseballStandingsMobile';
import { useIsMobile } from '@/hooks/use-mobile';

interface BaseballStandingsProps {
  standings: BaseballStanding[];
}

export function BaseballStandings({ standings }: BaseballStandingsProps) {
  const isMobile = useIsMobile();

  if (!standings || standings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucun classement disponible
      </div>
    );
  }

  // Group by league (American League / National League)
  const groupedByLeague = standings.reduce((acc, standing) => {
    const leagueName = standing.group_name || 'Classement Général';
    if (!acc[leagueName]) {
      acc[leagueName] = [];
    }
    acc[leagueName].push(standing);
    return acc;
  }, {} as Record<string, BaseballStanding[]>);

  // Mobile view
  if (isMobile) {
    return <BaseballStandingsMobile standings={standings} />;
  }

  // Desktop view
  return <BaseballStandingsTable standings={standings} />;
}
