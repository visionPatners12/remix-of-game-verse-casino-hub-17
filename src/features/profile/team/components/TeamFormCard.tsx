import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target } from 'lucide-react';
import { FootballApiFixtureData } from '@/types/footballApi';
import { getMatchResult, calculateGoalsDifference } from '@/services/teamServiceV2';

interface TeamFormCardProps {
  matches: FootballApiFixtureData[];
  teamId: string;
}

export function TeamFormCard({ matches, teamId }: TeamFormCardProps) {
  const { t } = useTranslation('pages');

  if (matches.length === 0) {
    return (
      <Card className="bg-card border">
        <CardContent className="p-grid-4 text-center">
          <div className="text-muted-foreground text-body">
            {t('team.form.noData')}
          </div>
        </CardContent>
      </Card>
    );
  }

  const { goalsFor, goalsAgainst } = calculateGoalsDifference(matches, teamId);
  const formResults = matches.map(match => getMatchResult(match, teamId));

  const getResultBadge = (result: 'W' | 'D' | 'L') => {
    switch (result) {
      case 'W':
        return (
          <div className="w-8 h-8 rounded-full bg-success text-success-foreground flex items-center justify-center text-caption font-bold">
            {t('team.form.win')}
          </div>
        );
      case 'D':
        return (
          <div className="w-8 h-8 rounded-full bg-warning text-warning-foreground flex items-center justify-center text-caption font-bold">
            {t('team.form.draw')}
          </div>
        );
      case 'L':
        return (
          <div className="w-8 h-8 rounded-full bg-error text-error-foreground flex items-center justify-center text-caption font-bold">
            {t('team.form.loss')}
          </div>
        );
    }
  };

  const wins = formResults.filter(r => r === 'W').length;
  const draws = formResults.filter(r => r === 'D').length;
  const losses = formResults.filter(r => r === 'L').length;

  return (
    <Card className="bg-card border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-subtitle">
          <TrendingUp className="w-5 h-5 text-primary" />
          {t('team.form.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-grid-4 pt-0">
        {/* Form Indicators */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {formResults.reverse().map((result, index) => (
            <div key={index}>
              {getResultBadge(result)}
            </div>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-caption text-muted-foreground mb-1">
              <Target className="w-4 h-4" />
              <span>{t('team.form.goalsFor')}</span>
            </div>
            <div className="text-competitive-subtitle font-bold text-success">
              {goalsFor}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-caption text-muted-foreground mb-1">
              <Target className="w-4 h-4" />
              <span>{t('team.form.goalsAgainst')}</span>
            </div>
            <div className="text-competitive-subtitle font-bold text-error">
              {goalsAgainst}
            </div>
          </div>
        </div>

        {/* Form Summary */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t">
          <Badge variant="secondary" className="text-caption">
            {wins}{t('team.form.win')}
          </Badge>
          <Badge variant="secondary" className="text-caption">
            {draws}{t('team.form.draw')}
          </Badge>
          <Badge variant="secondary" className="text-caption">
            {losses}{t('team.form.loss')}
          </Badge>
        </div>

        {/* Goals Difference */}
        <div className="text-center mt-3">
          <span className="text-caption text-muted-foreground">
            {t('team.form.difference')}: 
          </span>
          <span className={`ml-1 font-medium ${
            goalsFor - goalsAgainst > 0 ? 'text-success' : 
            goalsFor - goalsAgainst < 0 ? 'text-error' : 'text-muted-foreground'
          }`}>
            {goalsFor - goalsAgainst > 0 ? '+' : ''}{goalsFor - goalsAgainst}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
