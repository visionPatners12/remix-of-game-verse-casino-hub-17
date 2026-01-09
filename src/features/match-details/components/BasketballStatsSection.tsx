import React, { memo } from 'react';
import { BarChart3, Loader2 } from 'lucide-react';
import { useMatchData } from '../hooks/useMatchData';
import type { SupabaseMatchData } from '../hooks/useSupabaseMatchData';

interface BasketballStatsSectionProps {
  match: SupabaseMatchData;
}

// Score can be string "22 - 15" or object { home: 22, away: 15 }
type QuarterScore = string | { home: number; away: number } | null;

interface QuarterScores {
  q1: QuarterScore;
  q2: QuarterScore;
  q3: QuarterScore;
  q4: QuarterScore;
  overTime: QuarterScore;
}

interface StatBarProps {
  label: string;
  homeValue: number;
  awayValue: number;
}

const StatBar = memo(function StatBar({ label, homeValue, awayValue }: StatBarProps) {
  const total = homeValue + awayValue;
  const homePercent = total > 0 ? (homeValue / total) * 100 : 50;
  const awayPercent = total > 0 ? (awayValue / total) * 100 : 50;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-foreground">{homeValue}</span>
        <span className="text-muted-foreground text-xs uppercase tracking-wide">{label}</span>
        <span className="font-medium text-foreground">{awayValue}</span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden bg-muted/30">
        <div 
          className="bg-primary transition-all duration-500"
          style={{ width: `${homePercent}%` }}
        />
        <div 
          className="bg-muted-foreground/40 transition-all duration-500"
          style={{ width: `${awayPercent}%` }}
        />
      </div>
    </div>
  );
});

// Basketball stat labels - includes both NBA and generic basketball keys
const statLabels: Record<string, string> = {
  'Field Goals': 'Field Goals',
  'Field Goal Percentage': 'FG%',
  'Three Pointers': '3-Pointers',
  'Three Point Percentage': '3P%',
  'Free Throws': 'Free Throws',
  'Free Throw Percentage': 'FT%',
  'Rebounds': 'Rebounds',
  'Offensive Rebounds': 'Off. Rebounds',
  'Defensive Rebounds': 'Def. Rebounds',
  'Assists': 'Assists',
  'Steals': 'Steals',
  'Blocks': 'Blocks',
  'Turnovers': 'Turnovers',
  'Personal Fouls': 'Fouls',
  'Points in Paint': 'Points in Paint',
  'Fast Break Points': 'Fast Break Pts',
  'Second Chance Points': '2nd Chance Pts',
  'Bench Points': 'Bench Points',
  'Biggest Lead': 'Biggest Lead',
  'Points': 'Total Points',
  // Generic basketball stat keys (NBL, Euroleague, etc.)
  'Succesful Field Goals': 'FG Made',
  'Succesful 3 Pointers': '3P Made',
  'Succesful Free Throws': 'FT Made',
  'Total Field Goals': 'FG Attempts',
  'Total 3 Pointers': '3P Attempts',
  'Total Free Throws': 'FT Attempts',
};

const priorityStats = [
  'Points',
  'Field Goals',
  'Succesful Field Goals',
  'Field Goal Percentage',
  'Three Pointers',
  'Succesful 3 Pointers',
  'Three Point Percentage',
  'Free Throws',
  'Succesful Free Throws',
  'Free Throw Percentage',
  'Rebounds',
  'Offensive Rebounds',
  'Defensive Rebounds',
  'Assists',
  'Steals',
  'Blocks',
  'Turnovers',
  'Personal Fouls',
];

// Parse teams[] format to home/away structure
interface TeamsFormat {
  teams: Array<{
    team: { id: number; name: string; logo: string } | null;
    stats: Record<string, number | string>;
  }>;
}

function parseTeamsFormat(rawStats: TeamsFormat): { 
  home: Record<string, number | string>; 
  away: Record<string, number | string>;
  homeTeam?: { id: number; name: string; logo: string };
  awayTeam?: { id: number; name: string; logo: string };
} | null {
  if (!rawStats.teams || rawStats.teams.length < 2) return null;
  
  return {
    home: rawStats.teams[0]?.stats || {},
    away: rawStats.teams[1]?.stats || {},
    homeTeam: rawStats.teams[0]?.team || undefined,
    awayTeam: rawStats.teams[1]?.team || undefined,
  };
}

// Parse quarter score - can be string "22 - 15" or object { home: 22, away: 15 }
function parseQuarterScore(score: QuarterScore): { home: number; away: number } | null {
  if (!score) return null;
  
  // Object format (NBA): { home: number, away: number }
  if (typeof score === 'object' && 'home' in score && 'away' in score) {
    return {
      home: Number(score.home) || 0,
      away: Number(score.away) || 0
    };
  }
  
  // String format (generic basketball): "22 - 15"
  if (typeof score === 'string') {
    const parts = score.split(' - ').map(s => parseInt(s.trim(), 10));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { home: parts[0], away: parts[1] };
    }
  }
  
  return null;
}

export const BasketballStatsSection = memo(function BasketballStatsSection({ match }: BasketballStatsSectionProps) {
  const { data, isLoading, error } = useMatchData(match.id);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-sm">Loading statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">Error</h3>
        <p className="text-sm">Unable to load statistics</p>
      </div>
    );
  }

  const rawStatistics = data?.statistics;
  const states = data?.states as { scoreDetails?: QuarterScores; score?: string } | null;
  
  // Parse quarter scores
  const quarterScores = states?.scoreDetails;
  const q1 = parseQuarterScore(quarterScores?.q1 ?? null);
  const q2 = parseQuarterScore(quarterScores?.q2 ?? null);
  const q3 = parseQuarterScore(quarterScores?.q3 ?? null);
  const q4 = parseQuarterScore(quarterScores?.q4 ?? null);
  const ot = parseQuarterScore(quarterScores?.overTime ?? null);
  const finalScore = parseQuarterScore(states?.score ?? null);

  const hasQuarterData = q1 || q2 || q3 || q4 || ot;

  // Detect format: teams[] (generic basketball) vs home/away (NBA)
  const isTeamsFormat = rawStatistics && typeof rawStatistics === 'object' && 'teams' in rawStatistics && Array.isArray((rawStatistics as TeamsFormat).teams);
  const isHomeAwayFormat = rawStatistics && typeof rawStatistics === 'object' && 'home' in rawStatistics;
  
  // Parse the appropriate format
  let statistics: { home: Record<string, number | string>; away: Record<string, number | string> } | null = null;
  let teamsInfo: { homeTeam?: { id: number; name: string; logo: string }; awayTeam?: { id: number; name: string; logo: string } } = {};
  
  if (isTeamsFormat) {
    const parsed = parseTeamsFormat(rawStatistics as TeamsFormat);
    if (parsed) {
      statistics = { home: parsed.home, away: parsed.away };
      teamsInfo = { homeTeam: parsed.homeTeam, awayTeam: parsed.awayTeam };
    }
  } else if (isHomeAwayFormat) {
    statistics = rawStatistics as { home: Record<string, number | string>; away: Record<string, number | string> };
  }

  // Use teams info from statistics if available (for generic basketball), fallback to match data
  const homeName = teamsInfo.homeTeam?.name || match.home_team?.name || match.home || 'Équipe domicile';
  const awayName = teamsInfo.awayTeam?.name || match.away_team?.name || match.away || 'Équipe extérieur';
  const homeLogo = teamsInfo.homeTeam?.logo || match.home_team?.logo;
  const awayLogo = teamsInfo.awayTeam?.logo || match.away_team?.logo;

  // Skip if no data
  if (!statistics && !hasQuarterData) {
    return (
      <div className="space-y-6 p-4">
        {/* Team headers even when no stats */}
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-2">
            {homeLogo && (
              <img src={homeLogo} alt={homeName} className="w-8 h-8 object-contain" />
            )}
            <span className="font-semibold text-sm">{homeName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{awayName}</span>
            {awayLogo && (
              <img src={awayLogo} alt={awayName} className="w-8 h-8 object-contain" />
            )}
          </div>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Statistiques</h3>
          <p className="text-sm">Indisponible</p>
        </div>
      </div>
    );
  }

  // Create a map of all stats
  const statsMap = new Map<string, { home: number; away: number }>();
  
  if (statistics?.home) {
    Object.entries(statistics.home).forEach(([key, value]) => {
      const numValue = typeof value === 'string' 
        ? parseFloat(value.replace('%', '')) 
        : Number(value);
      statsMap.set(key, { home: numValue || 0, away: 0 });
    });
  }

  if (statistics?.away) {
    Object.entries(statistics.away).forEach(([key, value]) => {
      const numValue = typeof value === 'string' 
        ? parseFloat(value.replace('%', '')) 
        : Number(value);
      const existing = statsMap.get(key);
      if (existing) {
        existing.away = numValue || 0;
      } else {
        statsMap.set(key, { home: 0, away: numValue || 0 });
      }
    });
  }

  // Sort stats by priority
  const sortedStats = Array.from(statsMap.entries()).sort((a, b) => {
    const aIndex = priorityStats.indexOf(a[0]);
    const bIndex = priorityStats.indexOf(b[0]);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });


  // Quarters to display
  const quarters = [
    { label: 'Q1', data: q1 },
    { label: 'Q2', data: q2 },
    { label: 'Q3', data: q3 },
    { label: 'Q4', data: q4 },
    ...(ot ? [{ label: 'OT', data: ot }] : []),
    ...(finalScore ? [{ label: 'Final', data: finalScore }] : []),
  ].filter(q => q.data !== null);

  return (
    <div className="space-y-6 p-4">
      {/* Team headers */}
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-2">
          {homeLogo && (
            <img 
              src={homeLogo} 
              alt={homeName}
              className="w-8 h-8 object-contain"
            />
          )}
          <span className="font-semibold text-sm">{homeName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{awayName}</span>
          {awayLogo && (
            <img 
              src={awayLogo} 
              alt={awayName}
              className="w-8 h-8 object-contain"
            />
          )}
        </div>
      </div>

      {/* Quarter-by-quarter breakdown */}
      {quarters.length > 0 && (
        <div className="border-b border-border pb-6">
          <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-4 text-center">
            Score by Quarter
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs uppercase">
                  <th className="text-left py-2 px-2 font-medium">Team</th>
                  {quarters.map(q => (
                    <th 
                      key={q.label} 
                      className={`text-center py-2 px-3 font-medium ${q.label === 'Final' ? 'bg-primary/10 rounded' : ''}`}
                    >
                      {q.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Home team row */}
                <tr className="border-t border-border/50">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      {homeLogo && (
                        <img src={homeLogo} alt="" className="w-5 h-5 object-contain" />
                      )}
                      <span className="font-medium truncate max-w-[100px]">{homeName}</span>
                    </div>
                  </td>
                  {quarters.map(q => (
                    <td 
                      key={q.label} 
                      className={`text-center py-3 px-3 font-mono ${
                        q.label === 'Final' 
                          ? 'font-bold text-primary bg-primary/10 rounded' 
                          : ''
                      }`}
                    >
                      {q.data?.home ?? '-'}
                    </td>
                  ))}
                </tr>
                {/* Away team row */}
                <tr className="border-t border-border/50">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      {awayLogo && (
                        <img src={awayLogo} alt="" className="w-5 h-5 object-contain" />
                      )}
                      <span className="font-medium truncate max-w-[100px]">{awayName}</span>
                    </div>
                  </td>
                  {quarters.map(q => (
                    <td 
                      key={q.label} 
                      className={`text-center py-3 px-3 font-mono ${
                        q.label === 'Final' 
                          ? 'font-bold text-primary bg-primary/10 rounded' 
                          : ''
                      }`}
                    >
                      {q.data?.away ?? '-'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stats bars */}
      {sortedStats.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-wide text-muted-foreground text-center">
            Team Statistics
          </h4>
          {sortedStats.map(([type, values]) => (
            <StatBar
              key={type}
              label={statLabels[type] || type}
              homeValue={values.home}
              awayValue={values.away}
            />
          ))}
        </div>
      )}

      {/* No stats message */}
      {sortedStats.length === 0 && quarters.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">No statistics available for this match</p>
        </div>
      )}
    </div>
  );
});
