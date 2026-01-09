import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import { FootballApiFixtureData } from '@/types/footballApi';
import { formatToDoualaTime, getMatchResult } from '@/services/teamServiceV2';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface LastMatchCardProps {
  match: FootballApiFixtureData | null;
  teamId: string;
  onShareResult?: (content: string) => void;
}

export function LastMatchCard({ match, teamId, onShareResult }: LastMatchCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!match) {
    return (
      <Card className="bg-card border">
        <CardContent className="p-grid-4 text-center">
          <div className="text-muted-foreground text-body">
            No recent match
          </div>
        </CardContent>
      </Card>
    );
  }

  const isHome = match.teams.home.id === parseInt(teamId);
  const opponent = isHome ? match.teams.away : match.teams.home;
  const team = isHome ? match.teams.home : match.teams.away;
  const result = getMatchResult(match, teamId);
  
  const homeGoals = match.goals.home || 0;
  const awayGoals = match.goals.away || 0;
  
  const handleShareResult = () => {
    const scoreText = `${match.teams.home.name} ${homeGoals}-${awayGoals} ${match.teams.away.name}`;
    const resultEmoji = result === 'W' ? '🏆' : result === 'D' ? '🤝' : '😤';
    const postContent = `${resultEmoji} ${scoreText} #${team.name.replace(/\s+/g, '')}`;
    onShareResult?.(postContent);
  };

  const getResultColor = () => {
    switch (result) {
      case 'W': return 'text-success';
      case 'D': return 'text-warning';
      case 'L': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getResultBadge = () => {
    switch (result) {
      case 'W': return <Badge className="bg-success text-success-foreground">Win</Badge>;
      case 'D': return <Badge className="bg-warning text-warning-foreground">Draw</Badge>;
      case 'L': return <Badge className="bg-error text-error-foreground">Loss</Badge>;
      default: return null;
    }
  };

  return (
    <Card className="bg-card border hover:shadow-soft transition-all">
      <CardContent className="p-grid-4">
        <div className="flex items-center justify-between mb-3">
          {getResultBadge()}
          <Badge variant="outline" className="text-caption">
            {match.league.name}
          </Badge>
        </div>

        {/* Score Display */}
        <div className="text-center mb-4">
          <div className="text-competitive-title font-bold mb-2 text-foreground">
            {match.teams.home.name} 
            <span className={`mx-4 ${getResultColor()}`}>
              {homeGoals}-{awayGoals}
            </span>
            {match.teams.away.name}
          </div>
          
          {/* Team Logos */}
          <div className="flex items-center justify-center gap-grid-8">
            <div className="flex flex-col items-center gap-2">
              <img 
                src={match.teams.home.logo} 
                alt={match.teams.home.name}
                className="w-10 h-10 rounded"
              />
              <span className="text-caption text-muted-foreground truncate max-w-20">
                {match.teams.home.name}
              </span>
            </div>
            
            <div className="text-4xl font-bold text-primary">
              {homeGoals}-{awayGoals}
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <img 
                src={match.teams.away.logo} 
                alt={match.teams.away.name}
                className="w-10 h-10 rounded"
              />
              <span className="text-caption text-muted-foreground truncate max-w-20">
                {match.teams.away.name}
              </span>
            </div>
          </div>
        </div>

        {/* Match Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-caption text-muted-foreground justify-center">
            <Calendar className="w-4 h-4" />
            <span>{formatToDoualaTime(match.fixture.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-caption text-muted-foreground justify-center">
            <MapPin className="w-4 h-4" />
            <span>{match.fixture.venue.name}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={handleShareResult}
            variant="default" 
            size="sm" 
            className="flex-1"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share result
          </Button>
          
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm">
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className="p-3 bg-muted/30 rounded-lg text-caption text-muted-foreground">
                <p>Match details (stats, scorers, etc.) loading...</p>
                <p className="text-xs mt-1">🚧 Feature to be developed with events, statistics, lineups endpoints</p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
}