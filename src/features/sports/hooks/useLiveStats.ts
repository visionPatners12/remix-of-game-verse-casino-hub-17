import { useGame, useLiveStatistics, type LiveStatistics, type TennisScoreBoard, type VolleyballScoreBoard, type HomeGuest } from '@azuro-org/sdk';
import { GameState } from '@azuro-org/toolkit';

import { useMemo } from 'react';

// Type pour les données de basketball selon la spécification
type BasketballScoreBoard = {
  time: string; // the running time of the event
  q1: HomeGuest<number>; // points scored by each team in the 1st quarter
  q2: HomeGuest<number>; // points scored by each team in the 2nd quarter
  q3: HomeGuest<number>; // points scored by each team in the 3rd quarter
  q4: HomeGuest<number>; // points scored by each team in the 4th quarter
  total: HomeGuest<number>; // total points scored by each team
  overtime: HomeGuest<number>; // points scored by each team during overtime
  possession: HomeGuest<boolean>; // indicates which team currently has possession
  state: string; // the current state of the match (Q1, Q2, Q3, Q4, H1, H2, HT, FT, OT, F, IS)
};

// Type pour les stats détaillées basketball selon Azuro SDK
type BasketballStats = {
  fouls: HomeGuest<number>;
  freeThrows: HomeGuest<number>;
  freeThrowsScoredPerc: HomeGuest<number>;
  twoPointers: HomeGuest<number>;
  threePointers: HomeGuest<number>;
  timeoutsTaken: HomeGuest<number>;
  timeoutsRemaining: HomeGuest<number>;
  jumpBalls: HomeGuest<number>;
  assists: HomeGuest<number>;
  offensiveRebounds: HomeGuest<number>;
  defensiveRebounds: HomeGuest<number>;
  totalRebounds: HomeGuest<number>;
  turnovers: HomeGuest<number>;
  steals: HomeGuest<number>;
  blocks: HomeGuest<number>;
  playersDisqualified: HomeGuest<number>;
};

export interface LiveStatsData {
  currentSet?: number;
  setsWon: {
    home: number;
    away: number;
  };
  currentSetScore: {
    home: number;
    away: number;
  };
  gamePoints?: {
    home: number;
    away: number;
  };
  servingTeam?: 'home' | 'away';
  soccerGoals?: {
    home: number;
    away: number;
  };
  basketballTotal?: {
    home: number;
    away: number;
  };
  basketballQuarters?: {
    q1: { home: number; away: number };
    q2: { home: number; away: number };
    q3: { home: number; away: number };
    q4: { home: number; away: number };
  };
  basketballOvertime?: {
    home: number;
    away: number;
  };
  basketballPossession?: 'home' | 'away';
  basketballStats?: {
    fouls: { home: number; away: number } | null;
    freeThrows: { home: number; away: number } | null;
    freeThrowsScoredPerc: { home: number; away: number } | null;
    twoPointers: { home: number; away: number } | null;
    threePointers: { home: number; away: number } | null;
    timeoutsTaken: { home: number; away: number } | null;
    timeoutsRemaining: { home: number; away: number } | null;
    jumpBalls: { home: number; away: number } | null;
    assists: { home: number; away: number } | null;
    offensiveRebounds: { home: number; away: number } | null;
    defensiveRebounds: { home: number; away: number } | null;
    totalRebounds: { home: number; away: number } | null;
    turnovers: { home: number; away: number } | null;
    steals: { home: number; away: number } | null;
    blocks: { home: number; away: number } | null;
    playersDisqualified: { home: number; away: number } | null;
  };
  gameState?: string;
  gameTime?: string;
  isLoading: boolean;
  isAvailable: boolean;
  error?: Error;
}

// Helper functions to avoid code duplication
const parseGameState = (state?: string): number => {
  const match = state?.match(/S(\d)/);
  return match ? parseInt(match[1]) : 1;
};

const extractScoreData = (board: Record<string, unknown>, currentSet: number) => {
  const currentSetKey = `s${currentSet}`;
  const currentSetScore = board[currentSetKey] as { h?: number; g?: number } | undefined;
  const sets = board.sets as { h?: number; g?: number } | undefined;
  const servis = board.servis as { h?: boolean; g?: boolean } | undefined;
  
  return {
    setsWon: { home: sets?.h ?? 0, away: sets?.g ?? 0 },
    currentSetScore: { home: currentSetScore?.h ?? 0, away: currentSetScore?.g ?? 0 },
    servingTeam: servis?.h ? 'home' as const : 'away' as const,
    currentSet
  };
};

export function useLiveStats(game: Record<string, unknown>, sportSlug?: string) {
  const sport = game?.sport as Record<string, unknown> | undefined;
  
  // Extract values and verify they exist
  const gameId = game?.gameId as string | undefined;
  const sportId = sport?.sportId as string | undefined;
  const gameState = game?.state as GameState | undefined;
  
  // Only enable the hook if all required values are present
  const isEnabled = Boolean(gameId && sportId && gameState);
  
  const { data: statistics, isFetching, isAvailable } = useLiveStatistics({
    gameId: gameId || '',
    sportId: sportId || '',
    gameState: gameState || ('' as unknown as GameState),
    enabled: isEnabled,
  });

  const liveData = useMemo(() => {
    const isSupported = ['tennis', 'volleyball', 'soccer', 'football', 'basketball'].includes(sportSlug || '');
    
    if (!isSupported || !isAvailable || !statistics?.scoreBoard) {
      return {
        setsWon: { home: 0, away: 0 },
        currentSetScore: { home: 0, away: 0 },
        isLoading: isFetching,
        isAvailable,
      };
    }

    const scoreBoard = statistics.scoreBoard as Record<string, unknown>;
    const result: LiveStatsData = {
      setsWon: { home: 0, away: 0 },
      currentSetScore: { home: 0, away: 0 },
      isLoading: isFetching,
      isAvailable,
    };

    switch (sportSlug) {
      case 'tennis': {
        const tennisBoard = scoreBoard as TennisScoreBoard;
        const currentSet = parseGameState(tennisBoard.state);
        const scoreData = extractScoreData(tennisBoard, currentSet);
        
        Object.assign(result, scoreData, {
          gamePoints: {
            home: parseInt(tennisBoard.points?.h?.toString() || "0"),
            away: parseInt(tennisBoard.points?.g?.toString() || "0"),
          },
          gameState: tennisBoard.state
        });
        break;
      }
      
      case 'volleyball': {
        const volleyBoard = scoreBoard as VolleyballScoreBoard;
        const currentSet = parseGameState(volleyBoard.state);
        const scoreData = extractScoreData(volleyBoard, currentSet);
        
        Object.assign(result, scoreData, {
          gameState: volleyBoard.state
        });
        break;
      }
      
      case 'soccer':
      case 'football': {
        const soccerBoard = scoreBoard as Record<string, unknown>;
        const goals = soccerBoard.goals as { h?: number; g?: number } | undefined;
        result.soccerGoals = {
          home: goals?.h ?? 0,
          away: goals?.g ?? 0,
        };
        if (soccerBoard.time && typeof soccerBoard.time === 'string') {
          result.gameTime = soccerBoard.time;
        }
        break;
      }
        
      case 'basketball': {
        const bb = scoreBoard as BasketballScoreBoard;
        result.basketballTotal = {
          home: bb.total?.h ?? 0,
          away: bb.total?.g ?? 0,
        };
        result.basketballQuarters = {
          q1: { home: bb.q1?.h ?? 0, away: bb.q1?.g ?? 0 },
          q2: { home: bb.q2?.h ?? 0, away: bb.q2?.g ?? 0 },
          q3: { home: bb.q3?.h ?? 0, away: bb.q3?.g ?? 0 },
          q4: { home: bb.q4?.h ?? 0, away: bb.q4?.g ?? 0 },
        };
        result.basketballOvertime = {
          home: bb.overtime?.h ?? 0,
          away: bb.overtime?.g ?? 0,
        };
        result.basketballPossession = bb.possession?.h ? 'home' : 'away';
        if (bb.time) result.gameTime = bb.time;
        if (bb.state) result.gameState = bb.state;
        
        // Extract detailed basketball stats from statistics.stats
        const stats = statistics.stats as BasketballStats | undefined;
        if (stats) {
          // -1 means "not available" in Azuro API
          const extractStat = (stat: HomeGuest<number> | undefined): { home: number; away: number } | null => {
            if (!stat || stat.h === -1 || stat.g === -1) {
              return null;
            }
            return {
              home: stat.h ?? 0,
              away: stat.g ?? 0,
            };
          };
          
          result.basketballStats = {
            fouls: extractStat(stats.fouls),
            freeThrows: extractStat(stats.freeThrows),
            freeThrowsScoredPerc: extractStat(stats.freeThrowsScoredPerc),
            twoPointers: extractStat(stats.twoPointers),
            threePointers: extractStat(stats.threePointers),
            timeoutsTaken: extractStat(stats.timeoutsTaken),
            timeoutsRemaining: extractStat(stats.timeoutsRemaining),
            jumpBalls: extractStat(stats.jumpBalls),
            assists: extractStat(stats.assists),
            offensiveRebounds: extractStat(stats.offensiveRebounds),
            defensiveRebounds: extractStat(stats.defensiveRebounds),
            totalRebounds: extractStat(stats.totalRebounds),
            turnovers: extractStat(stats.turnovers),
            steals: extractStat(stats.steals),
            blocks: extractStat(stats.blocks),
            playersDisqualified: extractStat(stats.playersDisqualified),
          };
        }
        break;
      }
    }

    return result;
  }, [statistics, isFetching, isAvailable, sportSlug]);

  return liveData;
}