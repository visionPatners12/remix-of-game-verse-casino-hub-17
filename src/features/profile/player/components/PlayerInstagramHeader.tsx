import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { Player, PlayerStats } from '../types/player';
import { useNavigate } from 'react-router-dom';

interface PlayerInstagramHeaderProps {
  player: Player;
  stats?: PlayerStats | null;
  isFollowing?: boolean;
  followersCount?: number;
  onFollow?: () => void;
  isToggling?: boolean;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
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

export function PlayerInstagramHeader({ 
  player, 
  stats,
  isFollowing = false,
  followersCount = 0,
  onFollow,
  isToggling = false
}: PlayerInstagramHeaderProps) {
  const navigate = useNavigate();
  const profile = player.profile;
  
  const initials = player.fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const username = player.fullName.toLowerCase().replace(/\s+/g, '');
  const age = profile?.birthDate ? calculateAge(profile.birthDate) : null;
  
  // Sport-specific stat detection
  const isHockey = player.sportSlug === 'hockey' || player.sportSlug === 'ice-hockey';
  const isFootball = player.sportSlug === 'football' || player.sportSlug === 'soccer';

  // Get key stat from current season based on sport
  const currentSeason = stats?.perSeason?.[0];
  const keyStatValue = currentSeason?.stats?.find(s => {
    if (isHockey) return s.name === 'Points' || s.name === 'PTS' || s.name === 'Goals';
    if (isFootball) return s.name === 'Goals' || s.name === 'G';
    return s.name === 'PPG' || s.name === 'Points Per Game';
  })?.value;
  const keyStatLabel = isHockey ? 'PTS' : isFootball ? 'Goals' : 'PPG';

  // Count total games played
  const gamesPlayed = currentSeason?.stats?.find(s => 
    s.name === 'Games Played' || s.name === 'GP' || s.name === 'Appearances'
  )?.value || 0;
  
  // Check if position is valid
  const hasValidPosition = profile?.position?.main && 
    profile.position.main !== 'Unknown' && 
    profile.position.main !== '-' &&
    profile.position.main !== 'N/A';

  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-4">
        {/* Player Avatar - 80px like League/Team */}
        <div className="flex-shrink-0">
          <Avatar className="w-20 h-20 ring-2 ring-border/50">
            <AvatarImage src={player.logo || undefined} alt={player.fullName} className="object-cover" />
            <AvatarFallback className="text-xl font-bold bg-muted text-muted-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 min-w-0">
          {/* Name + Username */}
          <div className="mb-2">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-foreground truncate">
                {player.name || player.fullName}
              </h1>
              {profile?.isActive !== undefined && (
                <Badge 
                  variant={profile.isActive ? 'default' : 'secondary'}
                  className="text-[10px] h-4 px-1.5"
                >
                  {profile.isActive ? 'Active' : 'Inactive'}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">@{username}</p>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-6 mb-3">
            {gamesPlayed > 0 && (
              <div className="text-left">
                <div className="font-semibold text-foreground text-sm">{gamesPlayed}</div>
                <div className="text-xs text-muted-foreground">Games</div>
              </div>
            )}
            {keyStatValue !== undefined && (
              <div className="text-left">
                <div className="font-semibold text-foreground text-sm">{keyStatValue}</div>
                <div className="text-xs text-muted-foreground">{keyStatLabel}</div>
              </div>
            )}
            <div className="text-left">
              <div className="font-semibold text-foreground text-sm">{formatNumber(followersCount)}</div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-2">
            <Button 
              onClick={onFollow}
              disabled={isToggling}
              variant={isFollowing ? "outline" : "default"}
              className="h-7 px-4 text-xs font-medium flex-1"
            >
              {isToggling ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
            <Button 
              variant="outline"
              className="h-7 px-3 text-xs font-medium"
            >
              <Star size={14} />
            </Button>
          </div>

          {/* Secondary Info: Team + Position + Jersey */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {profile?.team && (
              <button 
                onClick={() => navigate(`/team/${profile.team?.id}`)}
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                {profile.team.logo && (
                  <img 
                    src={profile.team.logo} 
                    alt={profile.team.name} 
                    className="w-4 h-4 object-contain"
                  />
                )}
                <span>{profile.team.abbreviation || profile.team.name}</span>
              </button>
            )}
            {profile?.team && (hasValidPosition || profile?.team?.league) && (
              <span className="text-muted-foreground/50">•</span>
            )}
            {hasValidPosition ? (
              <span>{profile.position.main}</span>
            ) : profile?.team?.league && profile.team.league !== 'N/A' && (
              <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                {profile.team.league}
              </Badge>
            )}
            {(profile?.team || hasValidPosition) && profile?.jersey && profile.jersey !== '-' && (
              <span className="text-muted-foreground/50">•</span>
            )}
            {profile?.jersey && profile.jersey !== '-' && profile.jersey !== 'N/A' && (
              <span className="font-semibold">#{profile.jersey}</span>
            )}
            {age && (
              <>
                <span className="text-muted-foreground/50">•</span>
                <span>{age}y</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
