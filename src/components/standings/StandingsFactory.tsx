import { FootballStandings } from './football/FootballStandings';
import { BasketballStandings } from './basketball/BasketballStandings';
import { NBAStandings } from './nba/NBAStandings';
import { NFLStandings } from './nfl/NFLStandings';
import { HockeyStandings } from './hockey/HockeyStandings';
import { NHLStandings } from './hockey/NHLStandings';
import { RugbyStandings } from './rugby/RugbyStandings';
import { HandballStandings } from './handball/HandballStandings';
import { VolleyballStandings } from './volleyball/VolleyballStandings';
import { CricketStandings } from './cricket/CricketStandings';
import { BaseballStandings } from './baseball/BaseballStandings';
import { LeagueProfile } from '@/types/league';
import { useLeagueStandings } from '@/hooks/standings/useLeagueStandings';
import { useNFLStandings } from '@/hooks/standings/useNFLStandings';
import { useCricketStandings } from '@/hooks/standings/useCricketStandings';
import { useBaseballStandings } from '@/hooks/standings/useBaseballStandings';
import { useHockeyStandings } from '@/hooks/standings/useHockeyStandings';

interface StandingsFactoryProps {
  league: LeagueProfile;
}

// NHL and NCAA hockey leagues that use conference structure
const NHL_TIER_LEAGUES = ['nhl', 'ncaa', 'ncaa-hockey'];

function isNHLTierLeague(leagueSlug: string): boolean {
  return NHL_TIER_LEAGUES.some(tier => leagueSlug.includes(tier));
}

export function StandingsFactory({ league }: StandingsFactoryProps) {
  const sportSlug = league.sport_slug || 'football';
  const leagueSlug = league.slug?.toLowerCase() || '';

  // NFL : utiliser le hook spécifique
  if (sportSlug === 'american-football' || leagueSlug.includes('nfl')) {
    const { data: nflStandings, isLoading, error } = useNFLStandings(league.id);
    
    if (isLoading) {
      return <div className="text-center py-8">Loading standings...</div>;
    }
    
    if (error) {
      return <div className="text-center py-8 text-destructive">Error loading standings</div>;
    }
    
    if (!nflStandings || nflStandings.length === 0) {
      return <div className="text-center py-8 text-muted-foreground">No standings available</div>;
    }

    return <NFLStandings standings={nflStandings} />;
  }

  // NHL/NCAA Hockey: use conference structure like NBA
  if ((sportSlug === 'ice-hockey' || sportSlug === 'hockey') && isNHLTierLeague(leagueSlug)) {
    const { data: hockeyStandings, isLoading, error } = useHockeyStandings(league.id);
    
    if (isLoading) {
      return <div className="text-center py-8">Loading standings...</div>;
    }
    
    if (error) {
      return <div className="text-center py-8 text-destructive">Error loading standings</div>;
    }
    
    if (!hockeyStandings || hockeyStandings.length === 0) {
      return <div className="text-center py-8 text-muted-foreground">No standings available</div>;
    }

    return <NHLStandings standings={hockeyStandings} />;
  }

  // Other Hockey leagues: use generic hockey standings
  if (sportSlug === 'ice-hockey' || sportSlug === 'hockey') {
    return <HockeyStandings leagueId={league.id} />;
  }

  // Rugby : utiliser le hook spécifique
  if (sportSlug === 'rugby' || leagueSlug.includes('rugby')) {
    return <RugbyStandings leagueId={league.id} />;
  }

  // Handball : utiliser le hook spécifique
  if (sportSlug === 'handball' || leagueSlug.includes('handball')) {
    return <HandballStandings leagueId={league.id} />;
  }

  // Volleyball : utiliser le hook spécifique
  if (sportSlug === 'volleyball' || leagueSlug.includes('volleyball')) {
    return <VolleyballStandings leagueId={league.id} />;
  }

  // Cricket : utiliser le hook spécifique
  if (sportSlug === 'cricket' || leagueSlug.includes('cricket')) {
    const { data: cricketStandings, isLoading, error } = useCricketStandings(league.id);
    
    if (isLoading) {
      return <div className="text-center py-8">Loading standings...</div>;
    }
    
    if (error) {
      return <div className="text-center py-8 text-destructive">Error loading standings</div>;
    }
    
    if (!cricketStandings || cricketStandings.length === 0) {
      return <div className="text-center py-8 text-muted-foreground">No standings available</div>;
    }

    return <CricketStandings standings={cricketStandings} />;
  }

  // Baseball : utiliser le hook spécifique
  if (sportSlug === 'baseball' || leagueSlug.includes('mlb') || leagueSlug.includes('baseball')) {
    const { data: baseballStandings, isLoading, error } = useBaseballStandings(league.id);
    
    if (isLoading) {
      return <div className="text-center py-8">Loading standings...</div>;
    }
    
    if (error) {
      return <div className="text-center py-8 text-destructive">Error loading standings</div>;
    }
    
    if (!baseballStandings || baseballStandings.length === 0) {
      return <div className="text-center py-8 text-muted-foreground">No standings available</div>;
    }

    return <BaseballStandings standings={baseballStandings} />;
  }

  // Autres sports : utiliser le hook existant
  const { data: standings, isLoading, error } = useLeagueStandings(league.id);
  
  if (isLoading) {
    return <div className="text-center py-8">Loading standings...</div>;
  }
  
  if (error) {
    return <div className="text-center py-8 text-destructive">Error loading standings</div>;
  }
  
  if (!standings || standings.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No standings available</div>;
  }

  // NBA/WNBA
  if (leagueSlug.includes('nba') || leagueSlug.includes('wnba')) {
    return <NBAStandings standings={standings as any} />;
  }

  // Basketball générique
  if (sportSlug === 'basketball') {
    return <BasketballStandings leagueId={league.id} />;
  }

  // Football/Soccer par défaut
  return <FootballStandings standings={standings} />;
}