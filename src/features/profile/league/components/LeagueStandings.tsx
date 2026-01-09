import { LeagueProfile } from '@/types/league';
import { StandingsFactory } from '@/components/standings/StandingsFactory';

interface LeagueStandingsProps {
  league: LeagueProfile;
}

export function LeagueStandings({ league }: LeagueStandingsProps) {
  return <StandingsFactory league={league} />;
}