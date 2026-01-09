import React from 'react';
import { BasePost } from '@/features/social-feed/components/posts/base/BasePost';
import { Card, Button } from '@/ui';
import { Users, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TeamLink } from '@/features/social-feed/components/shared/TeamLink';
import { useLeagueNavigation } from '@/features/profile/league/hooks/useLeagueNavigation';
import { SelectionWithState } from '@/features/social-feed/components/posts/cards/SelectionWithState';
import { formatMatchDate } from '@/services/feed/utils';
import type { PostComponentProps, PredictionPost } from '@/types/posts';
import { labelOf } from '@/utils/labels';
import { useValidatedSelections } from '@/features/social-feed/hooks/useValidatedSelections';
import { calculateCombinedOdds } from '@/features/social-feed/components/posts/cards/useCombinedOdds';
import { cn } from '@/lib/utils';
import { useOddsDisplay } from '@/shared/hooks/useOddsDisplay';

/**
 * Prediction post component - KISS: Simplified with unified type system
 */
export function PredictionPostComponent(props: PostComponentProps<PredictionPost>) {
  const { post } = props;
  const prediction = post.predictionContent;
  const navigate = useNavigate();
  const { navigateToLeague } = useLeagueNavigation();

  if (!prediction) {
    return (
      <BasePost {...props}>
        <div className="text-sm text-foreground">{post.content}</div>
      </BasePost>
    );
  }

  const { match, selection, selections, bet_type = 'single', confidence, analysis, betAmount, currency, isPremium } = prediction;
  const { homeName, awayName, league, date } = match;
  
  // Support both legacy single selection and new multi-selections
  const rawSelections = selections || (selection ? [selection] : []);
  
  // ✅ Centralized validation using shared hook
  const validSelections = useValidatedSelections(rawSelections, `PredictionPost:${post.id}`);

  // If no valid selections, show error
  if (validSelections.length === 0) {
    console.error('[PredictionPost] No valid selections found for post:', post.id);
    return (
      <BasePost {...props}>
        <Card className="overflow-hidden border-destructive bg-destructive/5">
          <div className="p-4">
            <p className="text-destructive text-sm font-medium">❌ Invalid selection data</p>
          </div>
        </Card>
      </BasePost>
    );
  }
  
  const totalOdds = calculateCombinedOdds(validSelections);
  const isParlay = bet_type === 'parlay' || validSelections.length > 1;
  const { formattedOdds } = useOddsDisplay({ odds: totalOdds });

  return (
    <BasePost {...props}>
      <Card className={cn(
        "transition-all duration-300 relative overflow-hidden",
        isPremium && "border-amber-500/40 bg-gradient-to-br from-amber-500/5 via-transparent to-amber-600/5"
      )}>
        {/* Premium indicator line */}
        {isPremium && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />
        )}
        
        <div className="p-3 space-y-1.5">
          {/* League header */}
          <div className="mb-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {labelOf(league, 'Unknown League')}
              </span>
              {isPremium && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full font-medium">
                  <Lock className="h-3 w-3" />
                  Premium
                </span>
              )}
            </div>
          </div>

          {/* Match header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TeamLink teamName={homeName} className="text-foreground hover:text-primary transition-colors">
                {homeName}
              </TeamLink>
              <span className="text-muted-foreground">vs</span>
              <TeamLink teamName={awayName} className="text-foreground hover:text-primary transition-colors">
                {awayName}
              </TeamLink>
            </div>
            <time className="text-xs text-muted-foreground">
              {formatMatchDate(date)}
            </time>
          </div>

          {/* Confidence bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Confidence</span>
              <span className="text-xs font-bold text-foreground">{confidence}%</span>
            </div>
            <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${confidence}%`,
                  backgroundColor: confidence >= 80 ? '#22c55e' : confidence >= 60 ? '#f59e0b' : '#ef4444'
                }}
              />
            </div>
          </div>

          {/* Market selections */}
          <div className="space-y-3 mb-4">
            {isParlay && (
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                {validSelections.length} selections • Parlay
              </div>
            )}
            {validSelections.map((sel, idx) => (
              <SelectionWithState
                key={idx}
                selection={{
                  ...sel,
                  league: labelOf(league, 'Unknown League'),
                  matchName: sel.matchName || `${homeName} vs ${awayName}`
                }}
                match={match}
                showAddToTicket={!isParlay}
              />
            ))}
            {isParlay && (
              <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-primary uppercase tracking-wide">
                    Total Odds
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {formattedOdds}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Bet amount and potential win */}
          {betAmount && currency && (
            <div className="space-y-2 mb-4">
              <div className="bg-primary/5 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    Suggested Stake
                  </span>
                  <span className="text-sm font-bold text-primary">
                    {betAmount} {currency}
                  </span>
                </div>
              </div>
              {isParlay && (
                <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">
                      Potential Win
                    </span>
                    <span className="text-sm font-bold text-green-600">
                      {(betAmount * totalOdds - betAmount).toFixed(2)} {currency}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Analysis */}
          {analysis && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-foreground mb-2">Analysis</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {analysis}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {isParlay && (
              <Button
                variant="default"
                size="sm"
                disabled
                className="flex-1 opacity-50"
              >
                Parlay not available
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              disabled
              className="flex-1"
              onClick={() => navigate(`/match/unknown/unknown/unknown/${match.id}`)}
            >
              Go to Match
            </Button>
            <div className="flex items-center gap-1 text-xs text-muted-foreground px-2">
              <Users className="h-3 w-3" />
              <span>0</span>
            </div>
          </div>
        </div>
      </Card>
    </BasePost>
  );
}

PredictionPostComponent.displayName = 'PredictionPostComponent';