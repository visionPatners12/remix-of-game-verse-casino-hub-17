import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Environment variables
const H_KEY = Deno.env.get("HIGHLIGHTLY_KEY")!;
const H_BASE = Deno.env.get("HIGHLIGHTLY_BASE") ?? "https://sports.highlightly.net";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CACHE_TTL_MINUTES_LIVE = 1;
const CACHE_TTL_MINUTES_FINISHED = 60 * 24 * 7;

// Sport endpoint mapping
const SPORT_ENDPOINTS: Record<string, string> = {
  'football': 'football',
  'american-football': 'american-football',
  'basketball': 'basketball', // Default, will be overridden by getBasketballEndpoint
  'ice-hockey': 'hockey',
  'hockey': 'hockey', // Support both ice-hockey and hockey slugs
  'baseball': 'baseball',
  'cricket': 'cricket',
  'rugby': 'rugby',
  'volleyball': 'volleyball',
};

// NBA-tier leagues that use the /nba endpoint
const NBA_TIER_LEAGUES = ['nba', 'ncaa', 'nba-g-league', 'nba-summer-league', 'nba-cup'];

// NHL-tier leagues that use the /nhl endpoint
const NHL_TIER_LEAGUES = ['nhl', 'ncaa-hockey', 'nhl-preseason'];

function getBasketballEndpoint(leagueSlug?: string): string {
  if (leagueSlug && NBA_TIER_LEAGUES.includes(leagueSlug.toLowerCase())) {
    return 'nba';
  }
  return 'basketball';
}

function getHockeyEndpoint(leagueSlug?: string): string {
  if (leagueSlug && NHL_TIER_LEAGUES.includes(leagueSlug.toLowerCase())) {
    return 'nhl';
  }
  return 'hockey';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let stgAzuroId: string | null = null;

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      stgAzuroId = body.stgAzuroId;
    } else {
      const url = new URL(req.url);
      stgAzuroId = url.searchParams.get('stgAzuroId');
    }

    if (!stgAzuroId) {
      return new Response(
        JSON.stringify({ error: 'stgAzuroId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[fetch-match-data] Fetching for stgAzuroId: ${stgAzuroId}`);

    const sportsDataClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      db: { schema: 'sports_data' }
    });

    // Resolve stgAzuroId to match_id AND get sport slug + league slug
    const { data: stgGame, error: stgError } = await sportsDataClient
      .from('stg_azuro_games')
      .select('match_id, sport:sport_id(slug), league_azuro_slug')
      .eq('id', stgAzuroId)
      .single();

    if (stgError || !stgGame?.match_id) {
      console.error('[fetch-match-data] stg_azuro_games lookup failed:', stgError);
      return new Response(
        JSON.stringify({ error: 'Match not found in staging table' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

const matchId = stgGame.match_id;
    const sportSlug = (stgGame.sport as any)?.slug || 'football';
    const leagueSlug = stgGame.league_azuro_slug;
    const isAmericanFootball = sportSlug === 'american-football';
    const isCricket = sportSlug === 'cricket';
    const isRugby = sportSlug === 'rugby';
    const isBaseball = sportSlug === 'baseball';
    const isBasketball = sportSlug === 'basketball';
    const isVolleyball = sportSlug === 'volleyball';
    const isIceHockey = sportSlug === 'ice-hockey' || sportSlug === 'hockey';

    // Determine sport endpoint - special handling for basketball and hockey
    let sportEndpoint = SPORT_ENDPOINTS[sportSlug] || 'football';
    if (isBasketball) {
      sportEndpoint = getBasketballEndpoint(leagueSlug);
    } else if (isIceHockey) {
      sportEndpoint = getHockeyEndpoint(leagueSlug);
    }

    console.log(`[fetch-match-data] Resolved matchId: ${matchId}, sport: ${sportSlug}, league: ${leagueSlug}, endpoint: ${sportEndpoint}`);

    // Get match with highlightly_id and check cache
    const { data: match, error: matchError } = await sportsDataClient
      .from('match')
      .select('id, highlightly_id, home_team_id, away_team_id, events, statistics, venue, referee, forecast, shots, news, predictions, box_scores, top_performers, injuries, states, last_data_fetch, status_short')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      console.error('[fetch-match-data] Match lookup failed:', matchError);
      return new Response(
        JSON.stringify({ error: 'Match not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isFinished = ['FT', 'AET', 'PEN', 'CANC', 'ABD', 'AWD', 'WO'].includes(match.status_short || '');
    const cacheTtlMinutes = isFinished ? CACHE_TTL_MINUTES_FINISHED : CACHE_TTL_MINUTES_LIVE;

    // Check cache validity
    if (match.last_data_fetch && match.events) {
      const cacheAge = Date.now() - new Date(match.last_data_fetch).getTime();
      const cacheValid = cacheAge < cacheTtlMinutes * 60 * 1000;

      if (cacheValid) {
        console.log(`[fetch-match-data] Returning cached data (age: ${Math.round(cacheAge / 1000)}s)`);
        return new Response(
          JSON.stringify({
            source: 'cache',
            matchId,
            sportSlug,
            homeTeamId: match.home_team_id || null,
            awayTeamId: match.away_team_id || null,
            events: match.events || [],
            statistics: match.statistics || null,
            venue: match.venue || null,
            referee: match.referee || null,
            forecast: match.forecast || null,
            shots: match.shots || null,
            news: match.news || [],
            predictions: match.predictions || null,
            boxScores: match.box_scores || null,
            topPerformers: match.top_performers || null,
            injuries: match.injuries || null,
            states: match.states || null,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (!match.highlightly_id) {
      console.log('[fetch-match-data] No highlightly_id, returning empty data');
      return new Response(
        JSON.stringify({
          source: 'no_highlightly_id',
          matchId,
          sportSlug,
          homeTeamId: match.home_team_id || null,
          awayTeamId: match.away_team_id || null,
          events: [],
          statistics: null,
          venue: null,
          referee: null,
          forecast: null,
          shots: null,
          news: [],
          predictions: null,
          boxScores: null,
          topPerformers: null,
          injuries: null,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!H_KEY) {
      console.error('[fetch-match-data] HIGHLIGHTLY_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Dynamic API endpoint based on sport
    const apiUrl = `${H_BASE}/${sportEndpoint}/matches/${match.highlightly_id}`;
    console.log(`[fetch-match-data] Calling API: ${apiUrl}`);

    const apiResponse = await fetch(apiUrl, {
      headers: { 'x-rapidapi-key': H_KEY },
    });

    if (!apiResponse.ok) {
      console.error(`[fetch-match-data] API error: ${apiResponse.status}`);
      if (match.events) {
        return new Response(
          JSON.stringify({
            source: 'stale_cache',
            matchId,
            sportSlug,
            events: match.events || [],
            statistics: match.statistics || null,
            venue: match.venue || null,
            referee: match.referee || null,
            forecast: match.forecast || null,
            shots: match.shots || null,
            news: match.news || [],
            predictions: match.predictions || null,
            boxScores: match.box_scores || null,
            topPerformers: match.top_performers || null,
            injuries: match.injuries || null,
            states: match.states || null,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ error: 'Failed to fetch from API' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiDataRaw = await apiResponse.json();
    const apiData = Array.isArray(apiDataRaw) ? apiDataRaw[0] : apiDataRaw;
    
    console.log(`[fetch-match-data] API response received`, {
      isArray: Array.isArray(apiDataRaw),
      sport: sportSlug,
      hasEvents: !!apiData?.events,
      eventsCount: apiData?.events?.length || 0,
      hasStatistics: isAmericanFootball ? !!apiData?.matchStatistics : !!apiData?.statistics,
      hasVenue: !!apiData?.venue,
    });

    if (!apiData) {
      console.error('[fetch-match-data] Empty API response');
      return new Response(
        JSON.stringify({ error: 'Empty API response' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform data based on sport
    const homeTeamId = apiData.homeTeam?.id;
    const awayTeamId = apiData.awayTeam?.id;

    let transformedEvents: any[];
    let transformedStatistics: any;
    let shots: any = null;
    let boxScores: any = null;
    let topPerformers: any = null;
    let injuries: any = null;

    if (isCricket) {
      // Cricket-specific transformations
      transformedEvents = []; // Cricket doesn't have traditional events
      transformedStatistics = transformStatisticsCricket(apiData.statistics);
      topPerformers = transformTopPerformersCricket(apiData.bestBatsmen, apiData.bestBowlers);
      boxScores = transformSquadCricket(apiData.squad);
    } else if (isAmericanFootball) {
      transformedEvents = transformEventsAmericanFootball(apiData.events, matchId);
      transformedStatistics = transformStatisticsAmericanFootball(apiData.matchStatistics);
      boxScores = apiData.boxScores || null;
      topPerformers = apiData.topPerformers || null;
      injuries = transformInjuriesAmericanFootball(apiData.injuries, apiData.homeTeam, apiData.awayTeam);
    } else if (isRugby) {
      // Rugby-specific transformations
      transformedEvents = []; // Rugby doesn't have events in this API
      transformedStatistics = null; // No statistics in this API response
      boxScores = transformLineupsRugby(apiData.lineups, apiData.homeTeam, apiData.awayTeam);
    } else if (isBaseball) {
      // Baseball-specific transformations
      transformedEvents = transformPlaysBaseball(apiData.plays, matchId);
      transformedStatistics = transformStatsBaseball(apiData.stats);
      boxScores = transformRostersBaseball(apiData.rosters, apiData.homeTeam, apiData.awayTeam);
    } else if (isBasketball) {
      const isNbaTier = NBA_TIER_LEAGUES.includes((leagueSlug || '').toLowerCase());
      
      if (isNbaTier) {
        // NBA/NCAA Basketball - has events, matchStatistics, playerStatistics
        transformedEvents = transformEventsBasketball(apiData.events, matchId);
        transformedStatistics = transformStatisticsBasketball(apiData.matchStatistics);
        boxScores = transformPlayerStatisticsBasketball(apiData.playerStatistics, apiData.homeTeam, apiData.awayTeam);
      } else {
        // Generic basketball (NBL, Euroleague, etc.) - statistics[] array format, no events/playerStats
        console.log('[fetch-match-data] Generic basketball league detected, using statistics[] format');
        transformedEvents = [];
        transformedStatistics = transformStatisticsGenericBasketball(apiData.statistics);
        boxScores = null; // No player statistics available for generic basketball
      }
      shots = null;
    } else if (isVolleyball) {
      // Volleyball-specific transformations
      transformedEvents = []; // Volleyball doesn't have events
      transformedStatistics = null; // No statistics in volleyball API
      shots = null;
    } else if (isIceHockey) {
      // Ice Hockey-specific transformations
      const isNhlTier = NHL_TIER_LEAGUES.includes((leagueSlug || '').toLowerCase());
      
      if (isNhlTier && apiData.events) {
        // NHL/NCAA Hockey - has events and overallStatistics
        transformedEvents = transformEventsNhl(apiData.events, matchId);
        transformedStatistics = transformStatisticsNhl(apiData.overallStatistics);
      } else {
        // Generic hockey - no events/stats
        transformedEvents = [];
        transformedStatistics = null;
      }
      shots = null;
    } else {
      // Football and other sports
      transformedEvents = transformEventsFootball(apiData.events, matchId);
      transformedStatistics = transformStatisticsFootball(apiData.statistics, homeTeamId, awayTeamId);
      shots = {
        home: apiData.homeTeam?.shots || [],
        away: apiData.awayTeam?.shots || [],
      };
    }

    // Venue - adapted for all sports
    const venue = apiData.venue ? {
      name: apiData.venue.name || null,
      city: apiData.venue.city || null,
      country: apiData.venue.country || null,
      state: apiData.venue.state || null,
      capacity: apiData.venue.capacity || null,
    } : null;

    // Referee - for football and rugby (not American Football, Cricket, or Baseball)
    // Baseball and NHL use referees array (umpires)
    let referee: any = null;
    if (isBaseball && apiData.referees) {
      referee = transformRefereesBaseball(apiData.referees);
    } else if (isIceHockey && apiData.referees) {
      referee = transformRefereesNhl(apiData.referees);
    } else if (!isAmericanFootball && !isCricket && apiData.referee) {
      referee = {
        name: apiData.referee.name || null,
        nationality: apiData.referee.nationality || null,
      };
    }

    const forecast = apiData.forecast ? {
      status: apiData.forecast.status || null,
      temperature: apiData.forecast.temperature || null,
    } : null;

    console.log(`[fetch-match-data] Transformed data:`, {
      sport: sportSlug,
      eventsCount: transformedEvents.length,
      hasHomeStats: !!transformedStatistics?.home,
      hasAwayStats: !!transformedStatistics?.away,
      hasVenue: !!venue,
      hasBoxScores: !!boxScores,
      hasTopPerformers: !!topPerformers,
      hasInjuries: !!injuries,
    });

    // Upsert to database
    const updateData: Record<string, any> = {
      events: transformedEvents,
      statistics: transformedStatistics,
      venue,
      referee,
      forecast,
      shots,
      news: apiData.news || [],
      predictions: apiData.predictions || null,
      last_data_fetch: new Date().toISOString(),
    };

    // Add sport-specific fields
    if (isAmericanFootball || isCricket || isRugby || isBaseball || isBasketball) {
      updateData.box_scores = boxScores;
      if (isAmericanFootball || isCricket) {
        updateData.top_performers = topPerformers;
      }
      if (isAmericanFootball) {
        updateData.injuries = injuries;
      }
    }

    // Store baseball-specific data in states
    if (isBaseball) {
      updateData.states = {
        description: apiData.state?.description,
        report: apiData.state?.report,
        score: apiData.state?.score?.current,
        scoreDetails: {
          home: {
            hits: apiData.state?.score?.home?.hits || 0,
            errors: apiData.state?.score?.home?.errors || 0,
            innings: apiData.state?.score?.home?.innings || [],
          },
          away: {
            hits: apiData.state?.score?.away?.hits || 0,
            errors: apiData.state?.score?.away?.errors || 0,
            innings: apiData.state?.score?.away?.innings || [],
          },
        },
      };
    }

    // Store rugby-specific data in states
    if (isRugby) {
      updateData.states = {
        description: apiData.state?.description,
        score: apiData.state?.score, // "47 - 14"
      };
    }

    // Store cricket-specific data in states
    if (isCricket) {
      updateData.states = {
        description: apiData.state?.description,
        report: apiData.state?.report,
        teams: apiData.state?.teams,
        format: apiData.format,
        dayType: apiData.dayType,
      };
      updateData.highlightly_dates = {
        startDate: apiData.startDate,
        endDate: apiData.endDate,
        startTime: apiData.startTime,
      };
    }

    // Store basketball-specific data in states (quarter scores)
    if (isBasketball) {
      const isNbaTier = NBA_TIER_LEAGUES.includes((leagueSlug || '').toLowerCase());
      
      if (isNbaTier) {
        // NBA format: state.score.homeTeam and awayTeam are arrays [Q1, Q2, Q3, Q4, OT?]
        const homeScoreArr = apiData.state?.score?.homeTeam as number[] | undefined;
        const awayScoreArr = apiData.state?.score?.awayTeam as number[] | undefined;
        
        const homeTotal = calculateNbaTotal(homeScoreArr);
        const awayTotal = calculateNbaTotal(awayScoreArr);
        
        updateData.states = {
          description: apiData.state?.description,
          clock: apiData.state?.clock,
          period: apiData.state?.period,
          score: `${homeTotal} - ${awayTotal}`,
          scoreDetails: parseNbaQuarterScores(homeScoreArr, awayScoreArr),
        };
      } else {
        // Generic basketball format: state.score.current and q1/q2/q3/q4 strings
        updateData.states = {
          description: apiData.state?.description,
          clock: apiData.state?.clock,
          score: apiData.state?.score?.current,
          scoreDetails: {
            q1: apiData.state?.score?.q1 || null,
            q2: apiData.state?.score?.q2 || null,
            q3: apiData.state?.score?.q3 || null,
            q4: apiData.state?.score?.q4 || null,
            overTime: apiData.state?.score?.overTime || null,
          },
        };
      }
    }

    // Store volleyball-specific data in states (set scores)
    if (isVolleyball) {
      updateData.states = {
        description: apiData.state?.description,
        score: apiData.state?.score?.current,
        scoreDetails: {
          firstSet: apiData.state?.score?.firstSet || null,
          secondSet: apiData.state?.score?.secondSet || null,
          thirdSet: apiData.state?.score?.thirdSet || null,
          fourthSet: apiData.state?.score?.fourthSet || null,
          fifthSet: apiData.state?.score?.fifthSet || null,
        },
      };
    }

    // Store ice hockey-specific data in states (period scores)
    if (isIceHockey) {
      updateData.states = {
        description: apiData.state?.description,
        clock: apiData.state?.clock,
        period: apiData.state?.period,
        report: apiData.state?.report,
        score: apiData.state?.score?.current,
        scoreDetails: {
          firstPeriod: apiData.state?.score?.firstPeriod || null,
          secondPeriod: apiData.state?.score?.secondPeriod || null,
          thirdPeriod: apiData.state?.score?.thirdPeriod || null,
          overtimePeriod: apiData.state?.score?.overtimePeriod || null,
          penalties: apiData.state?.score?.penalties || null,
        },
      };
    }

    // Store american-football-specific data in states (quarter scores)
    if (isAmericanFootball) {
      updateData.states = {
        description: apiData.state?.description,
        clock: apiData.state?.clock,
        period: apiData.state?.period,
        report: apiData.state?.report,
        score: apiData.state?.score?.current,
        scoreDetails: {
          firstPeriod: apiData.state?.score?.firstPeriod || null,
          secondPeriod: apiData.state?.score?.secondPeriod || null,
          thirdPeriod: apiData.state?.score?.thirdPeriod || null,
          fourthPeriod: apiData.state?.score?.fourthPeriod || null,
          firstOvertimePeriod: apiData.state?.score?.firstOvertimePeriod || null,
          secondOvertimePeriod: apiData.state?.score?.secondOvertimePeriod || null,
        },
      };
    }

    // Store football (soccer) specific data in states (halves)
    if (!isAmericanFootball && !isCricket && !isRugby && !isBaseball && !isBasketball && !isVolleyball && !isIceHockey) {
      updateData.states = {
        description: apiData.state?.description,
        clock: apiData.state?.clock,
        period: apiData.state?.period,
        report: apiData.state?.report,
        score: apiData.state?.score?.current,
        scoreDetails: {
          firstHalf: apiData.state?.score?.firstHalf || null,
          secondHalf: apiData.state?.score?.secondHalf || null,
          extraTime: apiData.state?.score?.extraTime || null,
          penalties: apiData.state?.score?.penalties || null,
        },
      };
    }

    const { error: updateError } = await sportsDataClient
      .from('match')
      .update(updateData)
      .eq('id', matchId);

    if (updateError) {
      console.error('[fetch-match-data] Update error:', updateError);
    } else {
      console.log('[fetch-match-data] Updated match data in database');
    }

    return new Response(
      JSON.stringify({
        source: 'api',
        matchId,
        sportSlug,
        homeTeamId: match.home_team_id || null,
        awayTeamId: match.away_team_id || null,
        events: transformedEvents,
        statistics: transformedStatistics,
        venue,
        referee,
        forecast,
        shots,
        news: apiData.news || [],
        predictions: apiData.predictions || null,
        stage: apiData.stage || null,
        round: apiData.round || null,
        boxScores,
        topPerformers,
        injuries,
        states: updateData.states || null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[fetch-match-data] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ============= FOOTBALL TRANSFORMERS =============

function transformEventsFootball(events: any[], matchId: string) {
  return (events || []).map((event: any, index: number) => ({
    id: `${matchId}-event-${index}`,
    eventType: event.type || 'Unknown',
    eventTime: event.time || '0',
    team: {
      providerId: event.team?.id || 0,
      name: event.team?.name || '',
      logo: event.team?.logo || '',
    },
    player: {
      providerId: event.playerId || 0,
      name: event.player || '',
    },
    assistingPlayer: event.assist ? {
      providerId: event.assistingPlayerId || 0,
      name: event.assist,
    } : null,
    substitutedPlayer: event.substituted ? {
      providerId: event.assistingPlayerId || 0,
      name: event.substituted,
    } : null,
  }));
}

function transformStatisticsFootball(statistics: any[], homeTeamId: number, awayTeamId: number) {
  if (!statistics) return null;
  return {
    home: transformTeamStatsFootball(statistics.find((s: any) => s.team?.id === homeTeamId)),
    away: transformTeamStatsFootball(statistics.find((s: any) => s.team?.id === awayTeamId)),
  };
}

function transformTeamStatsFootball(teamData: any): Record<string, number | string> | null {
  if (!teamData?.statistics) return null;
  const stats: Record<string, number | string> = {};
  for (const stat of teamData.statistics) {
    if (stat.displayName && stat.value !== undefined) {
      stats[stat.displayName] = stat.value;
    }
  }
  return Object.keys(stats).length > 0 ? stats : null;
}

// ============= AMERICAN FOOTBALL TRANSFORMERS =============

function transformEventsAmericanFootball(events: any[], matchId: string) {
  return (events || []).map((event: any, index: number) => ({
    id: `${matchId}-event-${index}`,
    eventType: event.result || 'Drive',
    start: event.start || null,
    end: event.end || null,
    team: {
      providerId: event.team?.id || 0,
      name: event.team?.displayName || event.team?.name || '',
      logo: event.team?.logo || '',
      abbreviation: event.team?.abbreviation || null,
    },
    plays: event.plays || [],
    description: event.description || null,
    isScoringPlay: event.isScoringPlay || false,
  }));
}

function transformStatisticsAmericanFootball(matchStatistics: any) {
  if (!matchStatistics) return null;
  return {
    home: transformTeamStatsAmericanFootball(matchStatistics.homeTeam),
    away: transformTeamStatsAmericanFootball(matchStatistics.awayTeam),
  };
}

function transformTeamStatsAmericanFootball(teamData: any): Record<string, number | string> | null {
  if (!teamData?.statistics) return null;
  const stats: Record<string, number | string> = {};
  for (const stat of teamData.statistics) {
    // American Football uses "name" instead of "displayName"
    if (stat.name && stat.value !== undefined) {
      stats[stat.name] = stat.value;
    }
  }
  return Object.keys(stats).length > 0 ? stats : null;
}

// Transform injuries for American Football - convert array format to homeTeam/awayTeam structure
function transformInjuriesAmericanFootball(injuries: any[], homeTeam: any, awayTeam: any) {
  if (!injuries || !Array.isArray(injuries) || injuries.length === 0) return null;

  const homeTeamId = homeTeam?.id;
  const awayTeamId = awayTeam?.id;

  const result: {
    homeTeam: { name: string; logo: string; injuries: any[] } | null;
    awayTeam: { name: string; logo: string; injuries: any[] } | null;
  } = {
    homeTeam: null,
    awayTeam: null,
  };

  for (const teamInjury of injuries) {
    const teamId = teamInjury.team?.id;
    const teamData = teamInjury.team;
    const playerInjuries = (teamInjury.data || []).map((injury: any) => ({
      playerName: injury.player?.name || 'Unknown',
      jerseyNumber: injury.player?.jersey || null,
      position: injury.player?.position || null,
      status: injury.status || 'Unknown',
    }));

    const teamEntry = {
      name: teamData?.displayName || teamData?.name || 'Unknown',
      logo: teamData?.logo || '',
      injuries: playerInjuries,
    };

    if (teamId === homeTeamId) {
      result.homeTeam = teamEntry;
    } else if (teamId === awayTeamId) {
      result.awayTeam = teamEntry;
    } else {
      const teamName = (teamData?.displayName || teamData?.name || '').toLowerCase();
      const homeName = (homeTeam?.displayName || homeTeam?.name || '').toLowerCase();
      const awayName = (awayTeam?.displayName || awayTeam?.name || '').toLowerCase();
      
      if (teamName.includes(homeName) || homeName.includes(teamName)) {
        result.homeTeam = teamEntry;
      } else if (teamName.includes(awayName) || awayName.includes(teamName)) {
        result.awayTeam = teamEntry;
      } else {
        if (!result.awayTeam) {
          result.awayTeam = teamEntry;
        } else if (!result.homeTeam) {
          result.homeTeam = teamEntry;
        }
      }
    }
  }

  return result;
}

// ============= CRICKET TRANSFORMERS =============

function transformStatisticsCricket(statistics: any[]) {
  if (!statistics || !Array.isArray(statistics)) return null;
  
  // Real API structure: { inningNumber, team: { id, name, logo, abbreviation, fallOfWickets, inningBatsmen, inningBowlers, inningPartnerships } }
  return statistics.map((inning: any) => ({
    inningNumber: inning.inningNumber,
    team: {
      id: inning.team?.id,
      name: inning.team?.name,
      logo: inning.team?.logo,
      abbreviation: inning.team?.abbreviation,
      fallOfWickets: (inning.team?.fallOfWickets || []).map((fow: any) => ({
        runs: fow.runs,
        order: fow.order,
        overs: fow.overs,
        dismissalBatsman: fow.dismissalBatsman, // Keep as object { name: string }
      })),
      inningBatsmen: (inning.team?.inningBatsmen || []).map((b: any) => ({
        runs: b.runs,
        balls: b.balls,
        fours: b.fours,
        sixes: b.sixes,
        battingStrikeRate: b.battingStrikeRate,
        player: b.player, // Keep full object { name, roles, battingStyles, bowlingStyles }
      })),
      inningBowlers: (inning.team?.inningBowlers || []).map((bw: any) => ({
        overs: bw.overs,
        maidens: bw.maidens,
        wickets: bw.wickets,
        concededRuns: bw.concededRuns,
        economy: bw.economy,
        player: bw.player, // Keep full object
      })),
      inningPartnerships: (inning.team?.inningPartnerships || []).map((p: any) => ({
        runs: p.runs,
        balls: p.balls,
        overs: p.overs,
        firstPlayer: p.firstPlayer, // Keep as object { name: string }
        secondPlayer: p.secondPlayer,
        firstPlayerRuns: p.firstPlayerRuns,
        firstPlayerBalls: p.firstPlayerBalls,
        secondPlayerRuns: p.secondPlayerRuns,
        secondPlayerBalls: p.secondPlayerBalls,
      })),
    },
  }));
}

function transformTopPerformersCricket(bestBatsmen: any[], bestBowlers: any[]) {
  return {
    batsmen: (bestBatsmen || []).map((team: any) => ({
      team: {
        id: team.team?.id,
        name: team.team?.name,
        logo: team.team?.logo,
        abbreviation: team.team?.abbreviation,
      },
      players: (team.players || []).map((p: any) => ({
        name: p.name,
        runs: p.statistics?.runs,
        average: p.statistics?.average,
        innings: p.statistics?.innings,
        matches: p.statistics?.matches,
        strikeRate: p.statistics?.battingStrikeRate,
      })),
    })),
    bowlers: (bestBowlers || []).map((team: any) => ({
      team: {
        id: team.team?.id,
        name: team.team?.name,
        logo: team.team?.logo,
        abbreviation: team.team?.abbreviation,
      },
      players: (team.players || []).map((p: any) => ({
        name: p.name,
        wickets: p.statistics?.wickets,
        economy: p.statistics?.economy,
        average: p.statistics?.average,
        balls: p.statistics?.balls,
        concededRuns: p.statistics?.concededRuns,
        strikeRate: p.statistics?.battingStrikeRate,
      })),
    })),
  };
}

function transformSquadCricket(squad: any[]) {
  return (squad || []).map((team: any) => ({
    team: {
      id: team.team?.id,
      name: team.team?.name,
      logo: team.team?.logo,
      abbreviation: team.team?.abbreviation,
    },
    players: (team.players || []).map((p: any) => ({
      name: p.name,
      battingStyles: p.battingStyles,
      bowlingStyles: p.bowlingStyles,
      roles: p.roles,
    })),
  }));
}

// ============= RUGBY TRANSFORMERS =============

function transformLineupsRugby(lineups: any, homeTeam: any, awayTeam: any) {
  if (!lineups) return null;

  const mapPlayer = (player: any) => ({
    name: player.name || null,
    shortName: player.shortName || null,
    countryName: player.countryName || null,
    birth: player.birth || null,
    height: player.height || null,
    position: player.position || 'Unknown', // Forward, Back, Full Back, Prop
    shirtNumber: player.shirtNumber || null,
  });

  return {
    home: {
      team: {
        id: homeTeam?.id || null,
        name: homeTeam?.name || null,
        logo: homeTeam?.logo || null,
      },
      initialLineup: (lineups.home?.initialLineup || []).map(mapPlayer),
      substitutions: (lineups.home?.substitutions || []).map(mapPlayer),
    },
    away: {
      team: {
        id: awayTeam?.id || null,
        name: awayTeam?.name || null,
        logo: awayTeam?.logo || null,
      },
      initialLineup: (lineups.away?.initialLineup || []).map(mapPlayer),
      substitutions: (lineups.away?.substitutions || []).map(mapPlayer),
    },
  };
}

// ============= BASEBALL TRANSFORMERS =============

function transformPlaysBaseball(plays: any[], matchId: string) {
  if (!plays || !Array.isArray(plays)) return [];
  return plays.map((play: any, index: number) => ({
    id: `${matchId}-play-${index}`,
    type: play.type || 'Unknown',           // "Start Inning", etc.
    teamId: play.teamId || null,
    description: play.description || null,  // "Top of the 1st inning"
    period: play.period || null,            // "Top 1st Inning"
    currentOuts: play.currentOuts || 0,
    pitch: play.pitch ? {
      type: play.pitch.type || null,        // "CURVE"
      velocity: play.pitch.velocity || null,
      ballsCount: play.pitch.ballsCount || 0,
      strikesCount: play.pitch.strikesCount || 0,
    } : null,
    result: play.result ? {
      ballsCount: play.result.ballsCount || 0,
      strikesCount: play.result.strikesCount || 0,
    } : null,
    score: play.score ? {
      away: play.score.away || 0,
      home: play.score.home || 0,
    } : null,
  }));
}

function transformStatsBaseball(stats: any) {
  if (!stats) return null;
  
  const transformTeamStats = (teamStats: any) => {
    if (!teamStats) return null;
    
    // L'API retourne un objet direct, pas un array
    const statGroup = Array.isArray(teamStats) ? teamStats[0] : teamStats;
    if (!statGroup) return null;
    
    const batting = (statGroup.batting || [])
      .filter((s: any) => s)
      .map((s: any) => ({
        displayName: s.displayName || null,
        value: s.value ?? 0,
      }));
      
    const fielding = (statGroup.fielding || [])
      .filter((s: any) => s)
      .map((s: any) => ({
        displayName: s.displayName || null,
        value: s.value ?? 0,
      }));
      
    const pitching = (statGroup.pitching || [])
      .filter((s: any) => s)
      .map((s: any) => ({
        displayName: s.displayName || null,
        value: s.value ?? 0,
      }));
    
    if (batting.length === 0 && fielding.length === 0 && pitching.length === 0) {
      return null;
    }
    
    return { batting, fielding, pitching };
  };

  const home = transformTeamStats(stats.homeTeam);
  const away = transformTeamStats(stats.awayTeam);
  
  if (!home && !away) return null;

  return { homeTeam: home, awayTeam: away };
}

function transformRostersBaseball(rosters: any, homeTeam: any, awayTeam: any) {
  if (!rosters) return null;

  const mapPlayer = (player: any) => ({
    jersey: player.jersey || null,
    fullName: player.fullName || null,
    position: player.position || null,  // "First Baseman", "Pitcher", etc.
    isStarter: player.isStarter || false,
  });

  // Handle both single object and array format
  const processRoster = (roster: any) => {
    if (Array.isArray(roster)) {
      return roster.map(mapPlayer);
    } else if (roster) {
      return [mapPlayer(roster)];
    }
    return [];
  };

  return {
    home: {
      team: {
        id: homeTeam?.id || null,
        name: homeTeam?.displayName || homeTeam?.name || null,
        logo: homeTeam?.logo || null,
        abbreviation: homeTeam?.abbreviation || null,
      },
      players: processRoster(rosters.homeTeam),
    },
    away: {
      team: {
        id: awayTeam?.id || null,
        name: awayTeam?.displayName || awayTeam?.name || null,
        logo: awayTeam?.logo || null,
        abbreviation: awayTeam?.abbreviation || null,
      },
      players: processRoster(rosters.awayTeam),
    },
  };
}

function transformRefereesBaseball(referees: any[]) {
  if (!referees || !Array.isArray(referees)) return null;
  return referees.map((ref: any) => ({
    name: ref.name || null,
    position: ref.position || null,  // "Home Plate Umpire", "1st Base Umpire", etc.
  }));
}

// ============= BASKETBALL TRANSFORMERS (NBA/NCAA) =============

/**
 * Calculate total score from NBA array format [Q1, Q2, Q3, Q4, OT?]
 */
function calculateNbaTotal(scoreArr: number[] | undefined): number {
  if (!scoreArr || !Array.isArray(scoreArr)) return 0;
  return scoreArr.reduce((sum, val) => sum + (val || 0), 0);
}

/**
 * Extract quarter scores from NBA array format
 */
function parseNbaQuarterScores(homeArr: number[] | undefined, awayArr: number[] | undefined) {
  if (!homeArr || !awayArr || !Array.isArray(homeArr) || !Array.isArray(awayArr)) {
    return null;
  }
  
  const result: Record<string, { home: number; away: number }> = {};
  
  if (homeArr[0] !== undefined && awayArr[0] !== undefined) {
    result.q1 = { home: homeArr[0], away: awayArr[0] };
  }
  if (homeArr[1] !== undefined && awayArr[1] !== undefined) {
    result.q2 = { home: homeArr[1], away: awayArr[1] };
  }
  if (homeArr[2] !== undefined && awayArr[2] !== undefined) {
    result.q3 = { home: homeArr[2], away: awayArr[2] };
  }
  if (homeArr[3] !== undefined && awayArr[3] !== undefined) {
    result.q4 = { home: homeArr[3], away: awayArr[3] };
  }
  
  // Overtime: all quarters beyond the 4th
  if (homeArr.length > 4 && awayArr.length > 4) {
    const otHome = homeArr.slice(4).reduce((s, v) => s + (v || 0), 0);
    const otAway = awayArr.slice(4).reduce((s, v) => s + (v || 0), 0);
    result.overTime = { home: otHome, away: otAway };
  }
  
  return result;
}

/**
 * Transform matchStatistics from NBA/NCAA API format (name/value pairs)
 */
function transformStatisticsBasketball(matchStatistics: any) {
  if (!matchStatistics) return null;
  return {
    home: parseTeamStatsBasketball(matchStatistics.homeTeam?.statistics),
    away: parseTeamStatsBasketball(matchStatistics.awayTeam?.statistics),
  };
}

function parseTeamStatsBasketball(statistics: any[]): Record<string, any> | null {
  if (!statistics || !Array.isArray(statistics)) return null;
  const result: Record<string, any> = {};
  for (const stat of statistics) {
    if (stat.name) {
      result[stat.name] = stat.value;
    }
  }
  return Object.keys(result).length > 0 ? result : null;
}

/**
 * Transform events (play-by-play) from NBA/NCAA API format
 */
function transformEventsBasketball(events: any[], matchId: string) {
  if (!events || !Array.isArray(events)) return [];
  return events.map((event: any, index: number) => ({
    id: `${matchId}-event-${index}`,
    team: event.team ? {
      id: event.team.id,
      name: event.team.displayName || event.team.name,
      abbreviation: event.team.abbreviation,
      logo: event.team.logo,
    } : null,
    clock: event.clock || null,
    period: event.period || null,
    description: event.description || '',
    isScoringPlay: event.isScoringPlay || false,
    isShootingPlay: event.isShootingPlay || false,
  }));
}

/**
 * Transform playerStatistics from NBA/NCAA API format to box_scores structure
 */
function transformPlayerStatisticsBasketball(playerStatistics: any[], homeTeam: any, awayTeam: any) {
  if (!playerStatistics || !Array.isArray(playerStatistics)) return null;

  const homeTeamId = homeTeam?.id;
  const awayTeamId = awayTeam?.id;
  
  const result: { 
    home: { team: any; players: any[] } | null; 
    away: { team: any; players: any[] } | null;
  } = { home: null, away: null };

  for (const teamData of playerStatistics) {
    const teamId = teamData.team?.id;
    const players = (teamData.players || []).map((player: any) => ({
      name: player.name,
      position: player.position,
      stats: (player.data || []).reduce((acc: Record<string, any>, stat: any) => {
        if (stat.displayName) {
          acc[stat.displayName] = stat.value;
        }
        return acc;
      }, {}),
    }));

    const teamInfo = {
      id: teamData.team?.id,
      name: teamData.team?.displayName || teamData.team?.name,
      abbreviation: teamData.team?.abbreviation,
      logo: teamData.team?.logo,
    };

    if (teamId === homeTeamId) {
      result.home = { team: teamInfo, players };
    } else if (teamId === awayTeamId) {
      result.away = { team: teamInfo, players };
    } else {
      // Fallback: try to match by name
      const teamName = (teamData.team?.displayName || teamData.team?.name || '').toLowerCase();
      const homeName = (homeTeam?.displayName || homeTeam?.name || '').toLowerCase();
      const awayName = (awayTeam?.displayName || awayTeam?.name || '').toLowerCase();

      if (teamName.includes(homeName) || homeName.includes(teamName)) {
        result.home = { team: teamInfo, players };
      } else if (teamName.includes(awayName) || awayName.includes(teamName)) {
        result.away = { team: teamInfo, players };
      } else {
        // Last resort: assign to first available slot
        if (!result.home) {
          result.home = { team: teamInfo, players };
        } else if (!result.away) {
          result.away = { team: teamInfo, players };
        }
      }
    }
  }

  return result;
}

/**
 * Transform statistics from generic basketball API format (NBL, Euroleague, etc.)
 * Format: statistics[] array with { team: {...}, statistics: [{displayName, value}] }
 */
function transformStatisticsGenericBasketball(statistics: any[]) {
  if (!statistics || !Array.isArray(statistics)) return null;
  
  // Store as teams array with team info and flattened stats
  return {
    teams: statistics.map((teamStats: any) => ({
      team: teamStats.team ? {
        id: teamStats.team.id,
        name: teamStats.team.name,
        logo: teamStats.team.logo,
      } : null,
      stats: (teamStats.statistics || []).reduce((acc: Record<string, any>, stat: any) => {
        if (stat.displayName !== undefined) {
          acc[stat.displayName] = stat.value;
        }
        return acc;
      }, {}),
    })),
  };
}

// ============= NHL HOCKEY TRANSFORMERS =============

function transformEventsNhl(events: any[], matchId: string) {
  return (events || []).map((event: any, index: number) => ({
    id: `${matchId}-event-${index}`,
    eventType: event.type || 'Unknown', // "Shot", "Goal", etc.
    clock: event.clock || null,
    period: event.period || null,
    isScoringPlay: event.isScoringPlay || false,
    team: {
      providerId: event.team?.id || 0,
      name: event.team?.displayName || event.team?.name || '',
      abbreviation: event.team?.abbreviation || '',
      logo: event.team?.logo || '',
    },
  }));
}

function transformStatisticsNhl(overallStatistics: any[]) {
  if (!overallStatistics || !Array.isArray(overallStatistics)) return null;
  
  const result: { home: Record<string, string>; away: Record<string, string> } = {
    home: {},
    away: {},
  };
  
  // overallStatistics is an array with 2 objects (home and away)
  overallStatistics.forEach((teamStats, index) => {
    const target = index === 0 ? 'home' : 'away';
    if (teamStats?.data && Array.isArray(teamStats.data)) {
      for (const stat of teamStats.data) {
        if (stat.displayName && stat.value !== undefined) {
          result[target][stat.displayName] = stat.value;
        }
      }
    }
  });
  
  return result;
}

function transformRefereesNhl(referees: any[]) {
  if (!referees || !Array.isArray(referees)) return null;
  return referees.map(ref => ({
    name: ref.name || '',
    position: ref.position || '',
  }));
}
