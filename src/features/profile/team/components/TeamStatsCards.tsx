import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Shield, Activity, Zap, Edit3 } from 'lucide-react';
import { FootballApiTeamStatistics } from '@/types/footballApi';

interface TeamStatsCardsProps {
  statistics: FootballApiTeamStatistics | null;
  teamName: string;
  onCreatePost?: (content: string) => void;
}

export function TeamStatsCards({ statistics, teamName, onCreatePost }: TeamStatsCardsProps) {
  if (!statistics) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-grid-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-card border">
            <CardContent className="p-grid-4 text-center">
              <div className="text-muted-foreground text-body">
                Statistics not available
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Goals/match',
      value: parseFloat(statistics.goals.for.average.total).toFixed(1),
      icon: Target,
      color: 'text-success',
      bgColor: 'bg-success/10',
      description: `${statistics.goals.for.total.total} goals in ${statistics.fixtures.played.total} matches`
    },
    {
      title: 'Clean sheets',
      value: statistics.clean_sheet.total.toString(),
      icon: Shield,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      description: `${((statistics.clean_sheet.total / statistics.fixtures.played.total) * 100).toFixed(0)}% of matches`
    },
    {
      title: 'Matches played',
      value: statistics.fixtures.played.total.toString(),
      icon: Activity,
      color: 'text-amber',
      bgColor: 'bg-amber/10',
      description: `${statistics.fixtures.wins.total}W • ${statistics.fixtures.draws.total}D • ${statistics.fixtures.loses.total}L`
    },
    {
      title: 'Form',
      value: `${statistics.fixtures.wins.total}/${statistics.fixtures.played.total}`,
      icon: Zap,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      description: `${((statistics.fixtures.wins.total / statistics.fixtures.played.total) * 100).toFixed(0)}% wins`
    }
  ];

  const handleStatClick = (stat: typeof statsCards[0]) => {
    const hashtag = `#${teamName.replace(/\s+/g, '')}`;
    let postContent = '';
    
    switch (stat.title) {
      case 'Goals/match':
        postContent = `⚽ ${teamName} scores an average of ${stat.value} goals per match this season! ${hashtag}`;
        break;
      case 'Clean sheets':
        postContent = `🛡️ ${stat.value} clean sheets for ${teamName} this season! ${hashtag}`;
        break;
      case 'Matches played':
        postContent = `📊 ${teamName} record: ${stat.description} ${hashtag}`;
        break;
      case 'Form':
        postContent = `🔥 ${teamName} showing ${stat.description} this season! ${hashtag}`;
        break;
    }
    
    onCreatePost?.(postContent);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-subtitle font-semibold text-foreground">Team Statistics</h3>
        <div className="text-caption text-muted-foreground">
          Tap a stat to create a post
        </div>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-grid-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <Card 
              key={index}
              className="bg-card border hover:shadow-soft transition-all cursor-pointer group"
              onClick={() => handleStatClick(stat)}
            >
              <CardContent className="p-grid-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <Edit3 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div className="space-y-1">
                  <div className="text-competitive-subtitle font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-caption text-muted-foreground">
                    {stat.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stat.description}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-grid-4 mt-4">
        <Card className="bg-card border">
          <CardContent className="p-grid-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-subtitle font-medium">Home/Away Performance</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-caption">
              <div>
                <div className="text-muted-foreground mb-1">Home</div>
                <div className="space-y-1">
                  <div>{statistics.fixtures.wins.home}W • {statistics.fixtures.draws.home}D • {statistics.fixtures.loses.home}L</div>
                  <div className="text-success">{statistics.goals.for.average.home} goals/match</div>
                </div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Away</div>
                <div className="space-y-1">
                  <div>{statistics.fixtures.wins.away}W • {statistics.fixtures.draws.away}D • {statistics.fixtures.loses.away}L</div>
                  <div className="text-success">{statistics.goals.for.average.away} goals/match</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border">
          <CardContent className="p-grid-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-subtitle font-medium">Season Records</span>
            </div>
            <div className="space-y-2 text-caption">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Biggest win:</span>
                <span className="text-success font-medium">{statistics.biggest.wins.home || statistics.biggest.wins.away || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Biggest loss:</span>
                <span className="text-error font-medium">{statistics.biggest.loses.home || statistics.biggest.loses.away || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current streak:</span>
                <span className="font-medium">
                  {statistics.biggest.streak.wins > 0 ? `${statistics.biggest.streak.wins}W` :
                   statistics.biggest.streak.draws > 0 ? `${statistics.biggest.streak.draws}D` :
                   `${statistics.biggest.streak.loses}L`}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}