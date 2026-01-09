import React from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { FootballApiTeam, FootballApiVenue } from '@/types/footballApi';
import { formatNumber } from '@/utils/formatters';

interface InstagramStyleHeaderProps {
  team: FootballApiTeam;
  venue: FootballApiVenue;
  followersCount?: number;
  postsCount?: number;
  position?: number;
  points?: number;
  isFollowing?: boolean;
  isToggling?: boolean;
  onFollow?: () => void;
  onStaffClick?: () => void;
}

export function InstagramStyleHeader({ 
  team, 
  venue, 
  followersCount = 0, 
  postsCount = 0,
  position,
  points,
  isFollowing = false,
  isToggling = false,
  onFollow,
  onStaffClick
}: InstagramStyleHeaderProps) {
  const { t } = useTranslation('pages');

  return (
    <div className="bg-background px-4 py-3">
      <div className="flex items-center gap-4">
        {/* Team Avatar - 80px like League */}
        <Avatar className="w-20 h-20 ring-2 ring-border/50">
          <AvatarImage src={team.logo} alt={team.name} />
          <AvatarFallback className="text-2xl font-bold bg-muted text-muted-foreground">
            {team.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Info + Stats + Actions */}
        <div className="flex-1 min-w-0">
          {/* Name + Username */}
          <div className="mb-2">
            <h1 className="text-base font-semibold truncate">{team.name}</h1>
            <p className="text-xs text-muted-foreground">@{team.name.toLowerCase().replace(/\s+/g, '')}</p>
          </div>

          {/* Stats Row - Aligned left with gap-6 like League */}
          <div className="flex items-center gap-6 mb-3">
            <div className="text-left">
              <div className="font-semibold text-sm">{postsCount}</div>
              <div className="text-xs text-muted-foreground">{t('team.header.posts')}</div>
            </div>
            <div className="text-left">
              <div className="font-semibold text-sm">{formatNumber(followersCount)}</div>
              <div className="text-xs text-muted-foreground">{t('team.header.followers')}</div>
            </div>
            {position !== undefined && position > 0 && (
              <div className="text-left">
                <div className="font-semibold text-sm text-primary">{position}</div>
                <div className="text-xs text-muted-foreground">{t('team.header.rank')}</div>
              </div>
            )}
            {points !== undefined && (
              <div className="text-left">
                <div className="font-semibold text-sm">{points}</div>
                <div className="text-xs text-muted-foreground">{t('team.header.points')}</div>
              </div>
            )}
          </div>

          {/* Action Buttons - Like League */}
          <div className="flex gap-2">
            <Button 
              variant={isFollowing ? "outline" : "default"} 
              onClick={onFollow}
              disabled={isToggling}
              className="h-7 px-4 text-xs font-medium flex-1"
            >
              {isToggling ? '...' : isFollowing ? t('team.header.unfollow') : t('team.header.follow')}
            </Button>
            <Button 
              variant="outline" 
              onClick={onStaffClick}
              className="h-7 px-4 text-xs font-medium"
              aria-label="View team staff"
            >
              <Users className="h-3.5 w-3.5 mr-1" />
              {t('team.header.staff')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
