import { useNavigate } from 'react-router-dom';
import { TeamStandingDisplay } from '../../hooks/useTeamStandingsForDisplay';
import { buildLeagueUrl } from '@/utils/seoUrls';
import {
  NFLStatsCard,
  BasketballStatsCard,
  FootballStatsCard,
  HockeyStatsCard,
  BaseballStatsCard,
  GenericStatsCard,
  NBAStatsCard,
  NCAABasketballStatsCard,
  NHLStatsCard,
  NCAAHockeyStatsCard,
} from './stats';

// NBA tier leagues (use array format statistics)
const NBA_TIER_LEAGUES = [
  'nba', 'wnba', 'nba-g-league', 'nba-summer-league', 'nba-cup'
];

// NHL tier leagues (use array format statistics) - only NHL and NCAA
const NHL_TIER_LEAGUES = [
  'nhl', 'ncaa', 'ncaa-hockey'
];

function isNBATierLeague(leagueSlug: string): boolean {
  return NBA_TIER_LEAGUES.some(slug => leagueSlug?.toLowerCase().includes(slug));
}

function isNHLTierLeague(leagueSlug: string): boolean {
  return NHL_TIER_LEAGUES.some(slug => leagueSlug?.toLowerCase().includes(slug));
}

interface LeagueStandingsGroupProps {
  league: {
    id: string;
    name: string;
    logo?: string;
    slug?: string;
    country_name?: string;
  };
  standings: TeamStandingDisplay[];
  teamId: string;
  showLeagueHeader?: boolean;
}

export function LeagueStandingsGroup({
  league,
  standings,
  teamId,
  showLeagueHeader = true,
}: LeagueStandingsGroupProps) {
  const navigate = useNavigate();
  const sportSlug = standings[0]?.sport?.slug || 'football';
  const leagueSlug = league.slug || standings[0]?.league?.slug || '';

  const handleLeagueClick = () => {
    navigate(buildLeagueUrl({
      id: league.id,
      slug: league.slug,
      name: league.name,
      country_name: league.country_name,
    }));
  };

  // Render the appropriate stats card based on sport and league
  const renderStatsCard = (standing: TeamStandingDisplay) => {
    // Basketball - differentiate NBA from NCAA
    if (sportSlug === 'basketball') {
      if (isNBATierLeague(leagueSlug)) {
        return <NBAStatsCard standing={standing} />;
      }
      // NCAA or other basketball leagues
      return <NCAABasketballStatsCard standing={standing} />;
    }

    // Hockey - differentiate NHL from NCAA
    if (sportSlug === 'hockey') {
      if (isNHLTierLeague(leagueSlug)) {
        return <NHLStatsCard standing={standing} />;
      }
      // NCAA or other hockey leagues
      return <NCAAHockeyStatsCard standing={standing} />;
    }

    // Other sports
    switch (sportSlug) {
      case 'american-football':
        return <NFLStatsCard standing={standing} />;
      case 'baseball':
        return <BaseballStatsCard standing={standing} />;
      case 'football':
      case 'soccer':
        return <FootballStatsCard standing={standing} />;
      case 'volleyball':
      case 'rugby':
      case 'handball':
      case 'cricket':
        return <GenericStatsCard standing={standing} />;
      default:
        return <FootballStatsCard standing={standing} />;
    }
  };

  return (
    <div className="space-y-4">
      {/* League Header - Always shown */}
      <button
        onClick={handleLeagueClick}
        className="flex items-center gap-3 w-full p-3 rounded-lg bg-card hover:bg-accent/50 transition-colors group"
      >
        {league.logo && (
          <img
            src={league.logo}
            alt={league.name}
            className="w-8 h-8 object-contain rounded"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        )}
        <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          {league.name}
        </span>
      </button>

      {/* Standings Cards */}
      {standings.map((standing) => (
        <div key={standing.id}>
          {renderStatsCard(standing)}
        </div>
      ))}
    </div>
  );
}
