import { FootballStandingsTable } from './FootballStandingsTable';
import { FootballStandingsMobile } from './FootballStandingsMobile';
import { StandingsSkeletonLoader } from '@/components/ui/skeleton-loader';
import { useEffect, useState } from 'react';
import { FootballStanding } from '@/types/standings/football';

interface FootballStandingsProps {
  standings: FootballStanding[];
  loading?: boolean;
  error?: string | null;
}

export function FootballStandings({ standings, loading, error }: FootballStandingsProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      {isMobile ? (
        <FootballStandingsMobile standings={standings} />
      ) : (
        <FootballStandingsTable standings={standings} />
      )}
    </div>
  );
}