import { useTranslation } from 'react-i18next';
import { useTeamStandingsForDisplay, TeamStandingDisplay } from '../hooks/useTeamStandingsForDisplay';
import { LeagueStandingsGroup } from './standings';

interface TeamStandingsSectionProps {
  teamId: string | undefined;
  selectedLeagueId: string | null | undefined;
}

export function TeamStandingsSection({ teamId, selectedLeagueId }: TeamStandingsSectionProps) {
  const { t } = useTranslation('pages');
  const { data: standings, isLoading, error } = useTeamStandingsForDisplay(teamId, selectedLeagueId);

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">{t('team.standings.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">{t('team.standings.error')}</p>
      </div>
    );
  }

  if (!standings || standings.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">{t('team.standings.empty')}</p>
      </div>
    );
  }

  // Group by league
  const standingsByLeague = standings.reduce((acc, standing) => {
    const leagueId = standing.league.id;
    if (!acc[leagueId]) {
      acc[leagueId] = {
        league: standing.league,
        standings: [],
      };
    }
    acc[leagueId].standings.push(standing);
    return acc;
  }, {} as Record<string, { league: { id: string; name: string; logo: string }; standings: TeamStandingDisplay[] }>);

  const leagues = Object.values(standingsByLeague);

  return (
    <div className="space-y-6 pb-8">
      {leagues.map(({ league, standings: leagueStandings }) => (
        <LeagueStandingsGroup
          key={league.id}
          league={league}
          standings={leagueStandings}
          teamId={teamId || ''}
          showLeagueHeader={leagues.length > 1}
        />
      ))}
    </div>
  );
}
