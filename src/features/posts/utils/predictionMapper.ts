import type { PredictionWithSelections } from '../services/PredictionService';
import type { FeedPost } from '@/types/feed';

/**
 * Maps PredictionWithSelections to FeedPost compatible with TipPostCard
 */
export function mapPredictionToPost(prediction: PredictionWithSelections): FeedPost {
  const firstSelection = prediction.selections[0];
  
  return {
    id: prediction.id,
    type: 'prediction',
    activityId: prediction.stream_activity_id || prediction.id,
    author: {
      id: prediction.user.id,
      username: prediction.user.username,
      fullName: `${prediction.user.first_name} ${prediction.user.last_name}`.trim() || 'Utilisateur',
      avatar: prediction.user.avatar_url || undefined
    },
    timestamp: prediction.created_at,
    content: '',
    reactions: {
      likes: 0,
      comments: 0,
      shares: 0,
      userLiked: false
    },
    prediction: {
      match: {
        id: firstSelection?.match.id || '',
        date: firstSelection?.match.date || '',
        homeId: firstSelection?.match.id || '',
        homeName: firstSelection?.match.homeName || '',
        awayId: firstSelection?.match.id || '',
        awayName: firstSelection?.match.awayName || '',
        league: firstSelection?.match.league || '',
        leagueId: ''
      },
      selections: prediction.selections.map(sel => ({
        marketType: sel.market_type,
        pick: sel.pick,
        odds: sel.odds,
        conditionId: sel.condition_id,
        outcomeId: sel.outcome_id,
        matchName: `${sel.match.homeName} vs ${sel.match.awayName}`,
        league: sel.match.league
      })),
      confidence: prediction.confidence * 20, // DB: 1-5 → UI: 0-100
      analysis: prediction.analysis || undefined
    }
  };
}
