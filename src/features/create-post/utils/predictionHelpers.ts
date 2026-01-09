/**
 * Prediction Helpers - KISS + DRY utilities for prediction creation
 */

/**
 * Extract team names from prediction data
 */
export function extractTeamNames(prediction: any): { homeTeam: string; awayTeam: string } {
  const homeTeam = prediction.participants?.[0]?.name || 
                   prediction.matchTitle?.split(' vs ')[0] || 
                   'Home';
  const awayTeam = prediction.participants?.[1]?.name || 
                   prediction.matchTitle?.split(' vs ')[1] || 
                   'Away';
  return { homeTeam, awayTeam };
}

/**
 * Extract market data from Azuro betslip item
 * @param selection - The selection item
 * @param liveOdds - Live odds from Azuro SDK (optional)
 */
export function extractMarketData(selection: any, liveOdds?: number) {
  const rawOdds = liveOdds ?? selection.odds;
  // Fallback to 1.01 if odds are missing or <= 0 (DB constraint requires odds > 0)
  const odds = (rawOdds && rawOdds > 0) ? rawOdds : 1.01;
  
  if (!rawOdds || rawOdds <= 0) {
    console.warn('[extractMarketData] Missing or invalid odds, using fallback 1.01:', { liveOdds, selectionOdds: selection.odds });
  }
  
  return {
    marketType: selection.marketType || 'Unknown Market',
    pick: selection.pick || 'Unknown Pick',
    odds
  };
}

/**
 * Build match_data object for database
 */
export function buildMatchData(selection: any) {
  const { homeTeam, awayTeam } = extractTeamNames(selection);
  
  // Convert timestamp to ISO string if it's in milliseconds
  let startsAt = selection.startsAt;
  if (startsAt && typeof startsAt === 'number') {
    startsAt = new Date(startsAt).toISOString();
  }
  
  return {
    id: selection.gameId,
    homeTeam,
    awayTeam,
    matchName: selection.matchName || selection.matchTitle || `${homeTeam} vs ${awayTeam}`,
    league: selection.league,
    sport: selection.sport,
    startsAt,
    participants: selection.participants || []
  };
}

/**
 * Transform betslip item to selection format
 * @param item - Azuro betslip item
 * @param oddsMap - Record<outcomeId, odds> from useDetailedBetslip().odds
 */
export function transformBetslipItem(item: any, oddsMap?: Record<string, number>) {
  console.log('[transformBetslipItem] Raw input item:', {
    outcomeId: item.outcomeId,
    odds: item.odds,
    sport: item.sport,
    sportName: item.sportName,
    league: item.league,
    leagueName: item.leagueName,
    eventName: item.eventName
  });
  
  // Get live odds from Azuro SDK using composite key: conditionId-outcomeId
  const oddsKey = `${item.conditionId}-${item.outcomeId}`;
  const liveOdds = oddsMap?.[oddsKey];
  
  console.log('[transformBetslipItem] Odds lookup:', { 
    oddsKey,
    liveOdds, 
    itemOdds: item.odds,
    oddsMapKeys: oddsMap ? Object.keys(oddsMap).slice(0, 5) : []
  });
  
  const marketData = extractMarketData(item, liveOdds);
  
  // Extract sport - prioritize object.name over string
  const sportObj = item.sport;
  const sportName = 
    // Priority 1: sport object with name property
    (typeof sportObj === 'object' && sportObj?.name && sportObj.name.trim() !== '') 
      ? sportObj.name 
    // Priority 2: sportName string property
    : (item.sportName && typeof item.sportName === 'string' && item.sportName.trim() !== '') 
      ? item.sportName
    // Priority 3: sport as direct string
    : (typeof sportObj === 'string' && sportObj.trim() !== '') 
      ? sportObj 
    // Fallback
    : 'Unknown Sport';
  
  const sportSlug = item.sportSlug 
    || (typeof sportObj === 'object' ? sportObj?.slug : undefined);
  
  // Extract league - prioritize object.name over string
  const leagueObj = item.league;
  const leagueName = 
    // Priority 1: league object with name property
    (typeof leagueObj === 'object' && leagueObj?.name && leagueObj.name.trim() !== '') 
      ? leagueObj.name 
    // Priority 2: leagueName string property
    : (item.leagueName && typeof item.leagueName === 'string' && item.leagueName.trim() !== '') 
      ? item.leagueName
    // Priority 3: league as direct string
    : (typeof leagueObj === 'string' && leagueObj.trim() !== '') 
      ? leagueObj 
    // Fallback
    : 'Unknown League';
  
  const leagueSlug = item.leagueSlug 
    || (typeof leagueObj === 'object' ? leagueObj?.slug : undefined);
  
  // Extract participants  
  const participants = item.participants || [];
  
  const transformed = {
    gameId: item.gameId || '',
    conditionId: item.conditionId || '',
    outcomeId: item.outcomeId || '',
    marketType: marketData.marketType,
    pick: marketData.pick,
    odds: marketData.odds,
    matchName: item.eventName || 'Match',
    matchTitle: item.eventName || 'Match',
    sport: sportName,
    sportSlug: sportSlug,
    league: leagueName,
    leagueSlug: leagueSlug,
    participants: participants,
    startsAt: item.startsAt || null
  };

  console.log('[transformBetslipItem] Result:', {
    odds: transformed.odds,
    sport: transformed.sport,
    league: transformed.league
  });

  return transformed;
}
