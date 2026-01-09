import React from 'react';
import { BasePost } from '@/features/social-feed/components/posts/base/BasePost';
import { Card, Button } from '@/ui';
import { TrendingUp, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TeamLink } from '@/features/social-feed/components/shared/TeamLink';
import { AddToTicketButton } from '@/features/social-feed/components/shared/AddToTicketButton';
import { formatMatchDate } from '@/services/feed/utils';
import type { PostComponentProps, BetPost } from '@/types/posts';
import { labelOf } from '@/utils/labels';
import { useOddsDisplay } from '@/shared/hooks/useOddsDisplay';
/**
 * Bet post component - KISS: Simplified with unified type system
 */
export function BetPostComponent(props: PostComponentProps<BetPost>) {
  const { post } = props;
  const bet = post.betContent;
  const navigate = useNavigate();

  if (!bet) {
    return (
      <BasePost {...props}>
        <div className="text-sm text-foreground">{post.content}</div>
      </BasePost>
    );
  }

  const { match, selection, analysis, betAmount, currency } = bet;
  const { homeName, awayName, league, date } = match;
  const { marketType, pick, odds } = selection;
  const potentialWin = betAmount * odds;
  const { formattedOdds } = useOddsDisplay({ odds });

  return (
    <BasePost {...props}>
      <Card className="transition-all duration-300 relative overflow-hidden border-l-4 border-l-primary">
        <div className="p-3 space-y-3">
          {/* Bet header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-primary uppercase tracking-wide">
                Bet Placed
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {labelOf(league, 'Unknown League')}
            </span>
          </div>

          {/* Match header */}
          <div className="flex items-center justify-between">
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

          {/* Bet details */}
          <div className="bg-muted/30 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              {marketType} • {pick}
            </div>
              <div className="text-base font-bold text-foreground">
                {formattedOdds}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <DollarSign className="h-3 w-3" />
                <span>Stake</span>
              </div>
              <span className="text-sm font-bold text-foreground">
                {betAmount} {currency}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Potential Win</span>
              <span className="text-sm font-bold text-green-600">
                {potentialWin.toFixed(2)} {currency}
              </span>
            </div>
          </div>

          {/* Analysis */}
          {analysis && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground">Analysis</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {analysis}
              </p>
            </div>
          )}

          {/* Content */}
          {post.content && (
            <div className="text-sm text-foreground leading-relaxed">
              {post.content}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <AddToTicketButton
              selection={{
                conditionId: selection.conditionId,
                outcomeId: selection.outcomeId,
                odds
              }}
              match={match}
              className="flex-1"
            />
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => navigate(`/match/unknown/unknown/unknown/${match.id}`)}
            >
              View Match
            </Button>
          </div>
        </div>
      </Card>
    </BasePost>
  );
}

BetPostComponent.displayName = 'BetPostComponent';