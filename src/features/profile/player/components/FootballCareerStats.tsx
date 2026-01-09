import { useState, useMemo } from 'react';
import { PlayerStats, FootballCompetitionStats, FootballClubCareerStats } from '../types/player';
import { 
  Target, 
  Clock, 
  Trophy, 
  Users,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { GiSoccerKick } from 'react-icons/gi';
import { cn } from '@/lib/utils';

interface FootballCareerStatsProps {
  stats: PlayerStats;
}

type ViewMode = 'season' | 'club';

// Format minutes played to hours:minutes
const formatMinutes = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

// Competition Card Component
function CompetitionCard({ competition }: { competition: FootballCompetitionStats }) {
  return (
    <div className="border-b border-border py-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">{competition.league}</span>
        </div>
        <span className="text-xs text-muted-foreground">{competition.club}</span>
      </div>
      
      {/* Main Stats Row */}
      <div className="grid grid-cols-4 gap-2 mb-2">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <GiSoccerKick className="h-3.5 w-3.5 text-green-500" />
            <span className="text-sm font-semibold text-foreground">{competition.goals}</span>
          </div>
          <span className="text-[10px] text-muted-foreground">Goals</span>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <Target className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-sm font-semibold text-foreground">{competition.assists}</span>
          </div>
          <span className="text-[10px] text-muted-foreground">Assists</span>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">{competition.gamesPlayed}</span>
          </div>
          <span className="text-[10px] text-muted-foreground">Games</span>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">{formatMinutes(competition.minutesPlayed)}</span>
          </div>
          <span className="text-[10px] text-muted-foreground">Minutes</span>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        {competition.yellowCards > 0 && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-3 bg-yellow-400 rounded-[1px]" />
            {competition.yellowCards}
          </span>
        )}
        {competition.redCards > 0 && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-3 bg-red-500 rounded-[1px]" />
            {competition.redCards}
          </span>
        )}
        {competition.penaltiesScored > 0 && (
          <span>⚽ {competition.penaltiesScored} pens</span>
        )}
        {competition.substitutedIn > 0 && (
          <span className="flex items-center gap-0.5">
            <ArrowUpRight className="h-3 w-3 text-green-500" />
            {competition.substitutedIn}
          </span>
        )}
        {competition.substitutedOut > 0 && (
          <span className="flex items-center gap-0.5">
            <ArrowDownRight className="h-3 w-3 text-red-500" />
            {competition.substitutedOut}
          </span>
        )}
      </div>
    </div>
  );
}

// Club Career Card Component
function ClubCareerCard({ club }: { club: FootballClubCareerStats }) {
  return (
    <div className="border border-border rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <span className="text-lg font-bold text-foreground">{club.club.charAt(0)}</span>
        </div>
        <div>
          <h4 className="font-semibold text-foreground">{club.club}</h4>
          <p className="text-xs text-muted-foreground">
            {club.gamesPlayed} matches • {club.goals} ⚽ • {club.assists} 🅰️
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Goals</span>
          <span className="font-medium text-foreground">{club.goals}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Minutes</span>
          <span className="font-medium text-foreground">{club.minutesPlayed.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Assists</span>
          <span className="font-medium text-foreground">{club.assists}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Yellow Cards</span>
          <span className="font-medium text-foreground">{club.yellowCards}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Games</span>
          <span className="font-medium text-foreground">{club.gamesPlayed}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Red Cards</span>
          <span className="font-medium text-foreground">{club.redCards}</span>
        </div>
        {club.penaltiesScored > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Penalties</span>
            <span className="font-medium text-foreground">{club.penaltiesScored}</span>
          </div>
        )}
        {club.cleanSheets > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Clean Sheets</span>
            <span className="font-medium text-foreground">{club.cleanSheets}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function FootballCareerStats({ stats }: FootballCareerStatsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('season');
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);

  // Get unique seasons sorted by most recent
  const seasons = useMemo(() => {
    if (!stats.perCompetition) return [];
    const uniqueSeasons = [...new Set(stats.perCompetition.map(c => c.season))];
    return uniqueSeasons.sort((a, b) => {
      // Handle both "2025" and "2024/25" formats
      const yearA = parseInt(a.split('/')[0]);
      const yearB = parseInt(b.split('/')[0]);
      return yearB - yearA;
    });
  }, [stats.perCompetition]);

  // Initialize selected season
  const currentSeason = selectedSeason ?? seasons[0];

  // Filter competitions by selected season
  const seasonCompetitions = useMemo(() => {
    if (!stats.perCompetition || !currentSeason) return [];
    return stats.perCompetition.filter(c => c.season === currentSeason);
  }, [stats.perCompetition, currentSeason]);

  // Sort clubs by games played
  const sortedClubs = useMemo(() => {
    if (!stats.perClub) return [];
    return [...stats.perClub].sort((a, b) => b.gamesPlayed - a.gamesPlayed);
  }, [stats.perClub]);

  const hasSeasonData = stats.perCompetition && stats.perCompetition.length > 0;
  const hasClubData = stats.perClub && stats.perClub.length > 0;

  if (!hasSeasonData && !hasClubData) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No statistics available for this player.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      {hasSeasonData && hasClubData && (
        <div className="flex justify-center gap-1 p-1 bg-muted/50 rounded-lg">
          <button
            onClick={() => setViewMode('season')}
            className={cn(
              "flex-1 text-xs py-2 px-4 rounded-md transition-colors",
              viewMode === 'season'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            By Season
          </button>
          <button
            onClick={() => setViewMode('club')}
            className={cn(
              "flex-1 text-xs py-2 px-4 rounded-md transition-colors",
              viewMode === 'club'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            By Club
          </button>
        </div>
      )}

      {/* Season View */}
      {viewMode === 'season' && hasSeasonData && (
        <>
          {/* Season Selector */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {seasons.map((season) => (
              <button
                key={season}
                onClick={() => setSelectedSeason(season)}
                className={cn(
                  "text-xs px-3 py-1 rounded-full shrink-0 transition-colors",
                  currentSeason === season
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {season}
              </button>
            ))}
          </div>

          {/* Competition Cards */}
          <div>
            {seasonCompetitions.map((competition, index) => (
              <CompetitionCard key={`${competition.league}-${index}`} competition={competition} />
            ))}
          </div>
        </>
      )}

      {/* Club View */}
      {viewMode === 'club' && hasClubData && (
        <div className="space-y-3">
          {sortedClubs.map((club, index) => (
            <ClubCareerCard key={`${club.club}-${index}`} club={club} />
          ))}
        </div>
      )}

      {/* Fallback for single view mode */}
      {viewMode === 'season' && !hasSeasonData && hasClubData && (
        <div className="space-y-3">
          {sortedClubs.map((club, index) => (
            <ClubCareerCard key={`${club.club}-${index}`} club={club} />
          ))}
        </div>
      )}
      {viewMode === 'club' && !hasClubData && hasSeasonData && (
        <div>
          {seasonCompetitions.map((competition, index) => (
            <CompetitionCard key={`${competition.league}-${index}`} competition={competition} />
          ))}
        </div>
      )}
    </div>
  );
}