import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Edit3, Clock } from 'lucide-react';
import { FootballApiFixtureData } from '@/types/footballApi';
import { formatToDoualaTime } from '@/services/teamServiceV2';

interface NextMatchCardProps {
  match: FootballApiFixtureData | null;
  teamId: string;
  onWritePost?: (content: string) => void;
}

export function NextMatchCard({ match, teamId, onWritePost }: NextMatchCardProps) {
  if (!match) {
    return (
      <Card className="bg-card border">
        <CardContent className="p-grid-4 text-center">
          <div className="text-muted-foreground text-body">
            No upcoming match scheduled
          </div>
        </CardContent>
      </Card>
    );
  }

  const isHome = match.teams.home.id === parseInt(teamId);
  const opponent = isHome ? match.teams.away : match.teams.home;
  const team = isHome ? match.teams.home : match.teams.away;
  
  // Calculate days until match
  const matchDate = new Date(match.fixture.date);
  const now = new Date();
  const daysUntil = Math.ceil((matchDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  const handleWritePost = () => {
    const postContent = `#${team.name.replace(/\s+/g, '')} vs #${opponent.name.replace(/\s+/g, '')}`;
    onWritePost?.(postContent);
  };

  return (
    <Card className="bg-card border hover:shadow-soft transition-all">
      <CardContent className="p-grid-4">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="secondary" className="text-caption">
            <Clock className="w-3 h-3 mr-1" />
            {daysUntil > 0 ? `D-${daysUntil}` : daysUntil === 0 ? 'Today' : 'Live'}
          </Badge>
          <Badge variant="outline" className="text-caption">
            {match.league.name}
          </Badge>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-center gap-grid-4 mb-4">
          <div className="flex items-center gap-2 flex-1">
            <img 
              src={team.logo} 
              alt={team.name}
              className="w-8 h-8 rounded"
            />
            <span className="text-subtitle font-medium truncate">{team.name}</span>
          </div>
          
          <div className="text-competitive-subtitle font-bold text-primary px-2">
            VS
          </div>
          
          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className="text-subtitle font-medium truncate">{opponent.name}</span>
            <img 
              src={opponent.logo} 
              alt={opponent.name}
              className="w-8 h-8 rounded"
            />
          </div>
        </div>

        {/* Match Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-caption text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formatToDoualaTime(match.fixture.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-caption text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{match.fixture.venue.name}, {match.fixture.venue.city}</span>
          </div>
          <div className="flex items-center gap-2 text-caption">
            <Badge variant={isHome ? "secondary" : "outline"}>
              {isHome ? 'Home' : 'Away'}
            </Badge>
          </div>
        </div>

        {/* CTA Button */}
        <Button 
          onClick={handleWritePost}
          variant="outline" 
          size="sm" 
          className="w-full"
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Write a post
        </Button>
      </CardContent>
    </Card>
  );
}