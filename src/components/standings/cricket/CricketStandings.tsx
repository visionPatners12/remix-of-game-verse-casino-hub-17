import { CricketStanding } from '@/types/standings/cricket';
import { CricketStandingsTable } from './CricketStandingsTable';
import { CricketStandingsMobile } from './CricketStandingsMobile';
import { useEffect, useState } from 'react';

interface CricketStandingsProps {
  standings: CricketStanding[];
}

export function CricketStandings({ standings }: CricketStandingsProps) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    return <CricketStandingsMobile standings={standings} />;
  }

  return <CricketStandingsTable standings={standings} />;
}
