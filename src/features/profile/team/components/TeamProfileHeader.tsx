import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, MapPin, Calendar } from 'lucide-react';
import { FootballApiTeam, FootballApiVenue } from '@/types/footballApi';

interface TeamProfileHeaderProps {
  team: FootballApiTeam;
  venue: FootballApiVenue;
  followersCount?: number;
  postsCount?: number;
  isFollowing?: boolean;
  onFollow?: () => void;
}

export function TeamProfileHeader({ 
  team, 
  venue, 
  followersCount = 0, 
  postsCount = 0,
  isFollowing = false,
  onFollow 
}: TeamProfileHeaderProps) {
  return (
    <div className="bg-card border-b p-grid-4">
      <div className="flex items-start gap-grid-4">
        {/* Team Avatar */}
        <Avatar className="w-16 h-16 ring-2 ring-primary/20">
          <AvatarImage src={team.logo} alt={team.name} />
          <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
            {team.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Team Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-grid-2">
            <div className="flex-1 min-w-0">
              <h1 className="text-competitive-title text-foreground font-bold truncate">
                {team.name}
              </h1>
              
              {/* Country and Founded Year Chips */}
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary" className="text-caption">
                  <MapPin className="w-3 h-3 mr-1" />
                  {team.country}
                </Badge>
                {team.founded && (
                  <Badge variant="outline" className="text-caption">
                    <Calendar className="w-3 h-3 mr-1" />
                    {team.founded}
                  </Badge>
                )}
              </div>

              {/* Venue Info */}
              {venue && (
                <div className="text-caption text-muted-foreground mt-2">
                  {venue.name}, {venue.city}
                  {venue.capacity && (
                    <span className="ml-2">• {venue.capacity.toLocaleString()} seats</span>
                  )}
                </div>
              )}
            </div>

            {/* Empty space where Follow button was */}
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-grid-6 mt-3 text-caption text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              <span>{postsCount} posts</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{followersCount} followers</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <Button
              onClick={onFollow}
              variant={isFollowing ? "outline" : "default"}
              size="sm"
              className="h-7 px-4 text-xs font-medium"
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-4 text-xs font-medium"
            >
              <Users className="w-4 h-4 mr-1" />
              Squad
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}