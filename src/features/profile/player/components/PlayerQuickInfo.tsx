import { Player } from '../types/player';
import { User, Ruler, Calendar, MapPin, Flag, Footprints } from 'lucide-react';

interface PlayerQuickInfoProps {
  player: Player;
}

function calculateAge(birthDate: string): number | null {
  if (!birthDate || birthDate === 'Unknown') return null;
  
  let birth: Date;
  
  // Handle DD.MM.YYYY format (e.g., "30.12.1984")
  if (birthDate.includes('.')) {
    const parts = birthDate.split('.');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      birth = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      return null;
    }
  // Handle DD/MM/YYYY format (e.g., "24/06/1987")
  } else if (birthDate.includes('/')) {
    const parts = birthDate.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      birth = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      return null;
    }
  } else {
    // Handle ISO format or other standard formats
    birth = new Date(birthDate);
  }
  
  if (isNaN(birth.getTime())) return null;
  
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function PlayerQuickInfo({ player }: PlayerQuickInfoProps) {
  const { profile } = player;
  if (!profile) return null;

  const age = calculateAge(profile.birthDate);
  const position = profile.position?.main && profile.position.main !== 'Unknown' && profile.position.main !== '-' 
    ? profile.position.main : null;
  const positionAbbr = profile.position?.abbreviation && profile.position.abbreviation !== '-' 
    ? profile.position.abbreviation : null;
  const secondaryPosition = profile.position?.secondary;
  const jersey = profile.jersey && profile.jersey !== '-' && profile.jersey !== 'N/A' ? `#${profile.jersey}` : null;
  const height = profile.height && profile.height !== 'N/A' && profile.height !== '-' ? profile.height : null;
  const weight = profile.weight && profile.weight !== 'N/A' && profile.weight !== '-' ? profile.weight : null;
  const birthPlace = profile.birthPlace && profile.birthPlace !== 'Unknown' && profile.birthPlace !== '-' ? profile.birthPlace : null;
  const foot = profile.foot && profile.foot !== '-' ? profile.foot : null;
  const citizenship = profile.citizenship && profile.citizenship !== '-' ? profile.citizenship : null;
  
  // Team info for fallback when profile data is sparse
  const teamName = profile.team?.displayName || profile.team?.name;
  const teamLeague = profile.team?.league && profile.team.league !== 'N/A' ? profile.team.league : null;

  // Build info line - only if we have valid position or jersey
  const displayPosition = positionAbbr || position;
  const infoLine = [displayPosition, jersey].filter(Boolean).join(' ');

  const physicalLine = [
    height,
    weight,
  ].filter(Boolean).join(' • ');

  const personalLine = [
    age ? `${age} years old` : null,
    birthPlace,
  ].filter(Boolean).join(' • ');
  
  // Check if we have minimal data to display
  const hasAnyData = infoLine || physicalLine || personalLine || foot || citizenship || 
    (profile.draft && profile.draft.year > 0);
  const hasTeamInfo = teamName && teamLeague;

  return (
    <div className="space-y-2">
      {/* Position & Jersey */}
      {infoLine && (
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground font-medium">{infoLine}</span>
        </div>
      )}

      {/* Secondary Position (Football) */}
      {secondaryPosition && (
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground opacity-50" />
          <span className="text-muted-foreground">Also: {secondaryPosition}</span>
        </div>
      )}

      {/* Preferred Foot (Football) */}
      {foot && (
        <div className="flex items-center gap-2 text-sm">
          <Footprints className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground capitalize">{foot} foot</span>
        </div>
      )}

      {/* Height & Weight */}
      {physicalLine && (
        <div className="flex items-center gap-2 text-sm">
          <Ruler className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{physicalLine}</span>
        </div>
      )}

      {/* Age & Birthplace */}
      {personalLine && (
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{personalLine}</span>
        </div>
      )}

      {/* Citizenship (Football) */}
      {citizenship && (
        <div className="flex items-center gap-2 text-sm">
          <Flag className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{citizenship}</span>
        </div>
      )}

      {/* Draft Info (Basketball/American sports) */}
      {profile.draft && profile.draft.year > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Draft {profile.draft.year} • Round {profile.draft.round} • Pick {profile.draft.pick}
          </span>
        </div>
      )}
      
      {/* Fallback: Show team info when no other data available */}
      {!hasAnyData && hasTeamInfo && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground font-medium">{teamLeague} • {teamName}</span>
          </div>
          <p className="text-xs text-muted-foreground italic">
            Full profile data coming soon
          </p>
        </div>
      )}
    </div>
  );
}
