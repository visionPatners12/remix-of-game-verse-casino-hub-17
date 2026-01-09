import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const H_KEY = Deno.env.get("HIGHLIGHTLY_KEY")!;
const H_BASE = Deno.env.get("HIGHLIGHTLY_BASE") ?? "https://sports.highlightly.net";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// TTL du cache: 24h pour les H2H historiques
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// Map sport slugs to API endpoints
const SPORT_ENDPOINTS: Record<string, string> = {
  'football': 'football',
  'american-football': 'american-football',
  'nba': 'nba',
  'ncaa': 'nba',
  'nfl': 'american-football',
  'cricket': 'cricket',
  'rugby': 'rugby',
  'baseball': 'baseball',
  'basketball': 'basketball',
  'volleyball': 'volleyball',
  'hockey': 'hockey',
  'nhl': 'nhl',
  'ncaa-hockey': 'nhl',
};

// NBA-tier leagues that use /nba endpoint
const NBA_TIER_LEAGUES = ['nba', 'ncaa', 'nba-g-league', 'nba-summer-league', 'nba-cup'];

// NHL-tier leagues that use /nhl endpoint
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

function getSportEndpoint(sport: string, leagueSlug?: string): string {
  const baseSport = sport.toLowerCase();
  
  // Hockey: decide based on league
  if (baseSport === 'hockey' || baseSport === 'nhl' || baseSport === 'ncaa-hockey') {
    return getHockeyEndpoint(leagueSlug);
  }
  
  // Basketball: decide based on league
  if (baseSport === 'basketball' || baseSport === 'nba' || baseSport === 'ncaa') {
    return getBasketballEndpoint(leagueSlug);
  }
  
  return SPORT_ENDPOINTS[baseSport] || 'football';
}

interface ApiH2HMatch {
  id: number;
  round?: string;
  date: string;
  season?: number;
  country?: {
    code: string;
    name: string;
    logo?: string;
  };
  homeTeam: {
    id: number;
    name: string;
    displayName?: string;  // American Football
    abbreviation?: string; // American Football
    logo?: string;
  };
  awayTeam: {
    id: number;
    name: string;
    displayName?: string;  // American Football
    abbreviation?: string; // American Football
    logo?: string;
  };
  // League can be string (American Football) or object (Football)
  league?: {
    id: number;
    season?: number;
    name: string;
    logo?: string;
  } | string;
  state?: {
    period?: number;      // American Football
    clock?: number;
    description?: string;
    score?: {
      current?: string;
      penalties?: string;
      firstPeriod?: string;    // American Football / Hockey
      secondPeriod?: string;
      thirdPeriod?: string;
      fourthPeriod?: string;
      overtimePeriod?: string;   // Hockey NHL
      firstOvertimePeriod?: string;
      secondOvertimePeriod?: string;
      // Basketball quarter scores
      q1?: string;
      q2?: string;
      q3?: string;
      q4?: string;
      overTime?: string;
      // Volleyball set scores
      firstSet?: string;
      secondSet?: string;
      thirdSet?: string;
      fourthSet?: string;
      fifthSet?: string;
    };
    report?: string;  // American Football
  };
}

interface H2HMatch {
  id: string;
  date: string;
  homeTeam: {
    id: string;
    name: string;
    logo?: string;
  };
  awayTeam: {
    id: string;
    name: string;
    logo?: string;
  };
  homeScore: number;
  awayScore: number;
  competition?: {
    name: string;
    logo?: string;
  };
  // Cricket-specific data
  cricketData?: {
    format: string;
    homeScoreStr: string;
    awayScoreStr: string;
    report?: string;
    overs?: { home?: string; away?: string };
  };
  // Basketball-specific data
  basketballData?: {
    q1?: { home: number; away: number };
    q2?: { home: number; away: number };
    q3?: { home: number; away: number };
    q4?: { home: number; away: number };
    overTime?: { home: number; away: number };
  };
  // Volleyball-specific data
  volleyballData?: {
    set1?: { home: number; away: number };
    set2?: { home: number; away: number };
    set3?: { home: number; away: number };
    set4?: { home: number; away: number };
    set5?: { home: number; away: number };
  };
  // Hockey-specific data (NHL format with periods)
  hockeyData?: {
    firstPeriod?: { home: number; away: number };
    secondPeriod?: { home: number; away: number };
    thirdPeriod?: { home: number; away: number };
    overtimePeriod?: { home: number; away: number };
  };
}

// Cricket-specific API response interface
interface ApiCricketH2HMatch {
  id: string;
  startDate: string;
  endDate: string;
  startTime: string;
  format: string; // "T20", "ODI", "Test"
  dayType: string;
  homeTeam: { id: string; name: string; logo?: string; abbreviation?: string };
  awayTeam: { id: string; name: string; logo?: string; abbreviation?: string };
  league: { id: string; season: number; name: string; logo?: string };
  country?: { code: string; name: string; logo?: string };
  state: {
    description: string;
    report: string;
    teams: {
      home: { score: string; info?: string | null };
      away: { score: string; info?: string | null };
    };
  };
}

interface H2HSummary {
  homeWins: number;
  draws: number;
  awayWins: number;
  totalMatches: number;
}

function parseScore(scoreStr?: string): { home: number; away: number } {
  if (!scoreStr) return { home: 0, away: 0 };
  const parts = scoreStr.split(' - ').map(s => parseInt(s.trim(), 10));
  return {
    home: isNaN(parts[0]) ? 0 : parts[0],
    away: isNaN(parts[1]) ? 0 : parts[1]
  };
}

// Parse NBA score from array format [Q1, Q2, Q3, Q4, OT?]
function parseNbaScoreArray(scoreArr: number[] | undefined): number {
  if (!scoreArr || !Array.isArray(scoreArr)) return 0;
  return scoreArr.reduce((sum, val) => sum + (val || 0), 0);
}

// Parse NBA quarters from array format
function parseNbaQuarters(homeArr: number[] | undefined, awayArr: number[] | undefined): H2HMatch['basketballData'] {
  if (!homeArr || !awayArr || !Array.isArray(homeArr) || !Array.isArray(awayArr)) return undefined;
  
  const result: H2HMatch['basketballData'] = {};
  
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
  // OT if more than 4 periods
  if (homeArr.length > 4 && awayArr.length > 4) {
    const otHome = homeArr.slice(4).reduce((s, v) => s + (v || 0), 0);
    const otAway = awayArr.slice(4).reduce((s, v) => s + (v || 0), 0);
    if (otHome > 0 || otAway > 0) {
      result.overTime = { home: otHome, away: otAway };
    }
  }
  
  return Object.keys(result).length > 0 ? result : undefined;
}

// Parse cricket score "137/8" -> { runs: 137, wickets: 8 }
function parseCricketScore(scoreStr: string): { runs: number; wickets: number } {
  if (!scoreStr) return { runs: 0, wickets: 0 };
  const [runs, wickets] = scoreStr.split('/').map(s => parseInt(s.trim(), 10));
  return { runs: runs || 0, wickets: wickets || 0 };
}

// Determine winner from cricket state report
function determineCricketWinner(
  report: string, 
  homeTeamName: string, 
  awayTeamName: string,
  homeAbbr?: string,
  awayAbbr?: string
): 'home' | 'away' | 'draw' {
  const reportLower = report.toLowerCase();
  
  if (reportLower.includes('match drawn') || reportLower.includes('no result') || reportLower.includes('abandoned')) {
    return 'draw';
  }
  
  // Check if any home team identifier is in the report
  const homeNames = [homeTeamName, homeAbbr].filter(Boolean).map(n => n!.toLowerCase());
  const awayNames = [awayTeamName, awayAbbr].filter(Boolean).map(n => n!.toLowerCase());
  
  for (const name of homeNames) {
    if (reportLower.includes(name) && reportLower.includes('won')) return 'home';
  }
  for (const name of awayNames) {
    if (reportLower.includes(name) && reportLower.includes('won')) return 'away';
  }
  
  return 'draw';
}

function orderTeamIds(id1: string, id2: string): [string, string] {
  return id1 < id2 ? [id1, id2] : [id2, id1];
}

// Extract league info from flexible format (handles both football and cricket league structures)
function extractLeagueInfo(league: any): { name: string; logo?: string } | undefined {
  if (!league) return undefined;
  
  if (typeof league === 'string') {
    return { name: league, logo: undefined };
  }
  
  return { name: league.name, logo: league.logo };
}

// Get team display name (prefer displayName for American Football)
function getTeamName(team: ApiH2HMatch['homeTeam'] | ApiH2HMatch['awayTeam']): string {
  return team.displayName || team.name;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    let homeTeamId = url.searchParams.get("homeTeamId");
    let awayTeamId = url.searchParams.get("awayTeamId");
    let limit = parseInt(url.searchParams.get("limit") || "5", 10);
    let sport = url.searchParams.get("sport") || "football";
    let leagueSlug = url.searchParams.get("leagueSlug");

    // Support body JSON
    if (req.method === "POST") {
      try {
        const body = await req.json();
        homeTeamId = body.homeTeamId || homeTeamId;
        awayTeamId = body.awayTeamId || awayTeamId;
        limit = body.limit || limit;
        sport = body.sport || sport;
        leagueSlug = body.leagueSlug || leagueSlug;
      } catch (e) {
        console.log(`[fetch-h2h] No JSON body`);
      }
    }

    const sportEndpoint = getSportEndpoint(sport, leagueSlug || undefined);
    console.log(`[fetch-h2h] homeTeamId: ${homeTeamId}, awayTeamId: ${awayTeamId}, limit: ${limit}, sport: ${sport}, league: ${leagueSlug} -> ${sportEndpoint}`);

    if (!homeTeamId || !awayTeamId) {
      return new Response(
        JSON.stringify({ error: "Missing homeTeamId or awayTeamId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sportsDataClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      db: { schema: 'sports_data' }
    });

    // Step 1: Get teams with highlightly_id
    const { data: teams, error: teamsError } = await sportsDataClient
      .from('teams')
      .select('id, highlightly_id, name, logo')
      .in('id', [homeTeamId, awayTeamId]);

    if (teamsError || !teams || teams.length < 2) {
      console.error(`[fetch-h2h] Teams not found:`, teamsError);
      return new Response(
        JSON.stringify({ error: "Teams not found", summary: null, matches: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const homeTeam = teams.find(t => t.id === homeTeamId);
    const awayTeam = teams.find(t => t.id === awayTeamId);

    if (!homeTeam?.highlightly_id || !awayTeam?.highlightly_id) {
      console.log(`[fetch-h2h] Missing highlightly_id for teams`);
      return new Response(JSON.stringify({
        source: 'none',
        summary: { homeWins: 0, draws: 0, awayWins: 0, totalMatches: 0 },
        matches: []
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Step 2: Order team IDs for consistent cache lookup
    const [team1Id, team2Id] = orderTeamIds(homeTeamId, awayTeamId);
    const isHomeTeamFirst = homeTeamId === team1Id;

    // Step 3: Check cache
    const { data: cached, error: cacheError } = await sportsDataClient
      .from('h2h_records')
      .select(`
        *,
        match_1:match_1_id(id, date, highlightly_id, home_team:home_team_id(id, name, logo), away_team:away_team_id(id, name, logo), home_score, away_score, league:league_id(name, logo)),
        match_2:match_2_id(id, date, highlightly_id, home_team:home_team_id(id, name, logo), away_team:away_team_id(id, name, logo), home_score, away_score, league:league_id(name, logo)),
        match_3:match_3_id(id, date, highlightly_id, home_team:home_team_id(id, name, logo), away_team:away_team_id(id, name, logo), home_score, away_score, league:league_id(name, logo)),
        match_4:match_4_id(id, date, highlightly_id, home_team:home_team_id(id, name, logo), away_team:away_team_id(id, name, logo), home_score, away_score, league:league_id(name, logo)),
        match_5:match_5_id(id, date, highlightly_id, home_team:home_team_id(id, name, logo), away_team:away_team_id(id, name, logo), home_score, away_score, league:league_id(name, logo))
      `)
      .eq('team_1_id', team1Id)
      .eq('team_2_id', team2Id)
      .single();

    const now = Date.now();

    if (!cacheError && cached) {
      const cacheAge = now - new Date(cached.last_fetched_at).getTime();

      if (cacheAge < CACHE_TTL_MS) {
        console.log(`[fetch-h2h] Cache hit, age: ${Math.round(cacheAge / 1000 / 60)}min`);

        const matches: H2HMatch[] = [];
        for (let i = 1; i <= 5; i++) {
          const m = cached[`match_${i}`];
          if (m) {
            const score = { home: m.home_score ?? 0, away: m.away_score ?? 0 };
            matches.push({
              id: m.id,
              date: m.date,
              homeTeam: {
                id: m.home_team?.id || '',
                name: m.home_team?.name || 'Unknown',
                logo: m.home_team?.logo
              },
              awayTeam: {
                id: m.away_team?.id || '',
                name: m.away_team?.name || 'Unknown',
                logo: m.away_team?.logo
              },
              homeScore: score.home,
              awayScore: score.away,
              competition: m.league ? { name: m.league.name, logo: m.league.logo } : undefined
            });
          }
        }

        // Adjust wins based on which team is home in original request
        const summary: H2HSummary = {
          homeWins: isHomeTeamFirst ? cached.team_1_wins : cached.team_2_wins,
          awayWins: isHomeTeamFirst ? cached.team_2_wins : cached.team_1_wins,
          draws: cached.draws,
          totalMatches: cached.total_matches
        };

        return new Response(JSON.stringify({
          source: 'cache',
          summary,
          matches: matches.slice(0, limit)
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      console.log(`[fetch-h2h] Cache expired, age: ${Math.round(cacheAge / 1000 / 60)}min`);
    }

    // Step 4: Fetch from Highlightly API with dynamic sport endpoint
    const apiUrl = `${H_BASE}/${sportEndpoint}/head-2-head?teamIdOne=${homeTeam.highlightly_id}&teamIdTwo=${awayTeam.highlightly_id}`;
    console.log(`[fetch-h2h] Fetching from API: ${apiUrl}`);

    const apiResponse = await fetch(apiUrl, {
      headers: { "x-rapidapi-key": H_KEY }
    });

    if (!apiResponse.ok) {
      console.error(`[fetch-h2h] API error: ${apiResponse.status}`);

      // Return stale cache if available
      if (cached) {
        const matches: H2HMatch[] = [];
        for (let i = 1; i <= 5; i++) {
          const m = cached[`match_${i}`];
          if (m) {
            matches.push({
              id: m.id,
              date: m.date,
              homeTeam: { id: m.home_team?.id || '', name: m.home_team?.name || 'Unknown', logo: m.home_team?.logo },
              awayTeam: { id: m.away_team?.id || '', name: m.away_team?.name || 'Unknown', logo: m.away_team?.logo },
              homeScore: m.home_score ?? 0,
              awayScore: m.away_score ?? 0,
              competition: m.league ? { name: m.league.name, logo: m.league.logo } : undefined
            });
          }
        }

        return new Response(JSON.stringify({
          source: 'cache',
          summary: {
            homeWins: isHomeTeamFirst ? cached.team_1_wins : cached.team_2_wins,
            awayWins: isHomeTeamFirst ? cached.team_2_wins : cached.team_1_wins,
            draws: cached.draws,
            totalMatches: cached.total_matches
          },
          matches: matches.slice(0, limit),
          warning: 'API unavailable, serving stale cache'
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      return new Response(
        JSON.stringify({ error: "Failed to fetch H2H data", summary: null, matches: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiRawResponse = await apiResponse.json();
    const isCricket = sportEndpoint === 'cricket';
    console.log(`[fetch-h2h] Received ${Array.isArray(apiRawResponse) ? apiRawResponse.length : 0} H2H matches for ${sportEndpoint}`);

    if (!Array.isArray(apiRawResponse) || apiRawResponse.length === 0) {
      return new Response(JSON.stringify({
        source: 'api',
        summary: { homeWins: 0, draws: 0, awayWins: 0, totalMatches: 0 },
        matches: []
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Step 5: Upsert matches into sports_data.match and collect IDs
    const matchIds: (string | null)[] = [null, null, null, null, null];
    const transformedMatches: H2HMatch[] = [];

    let team1Wins = 0;
    let team2Wins = 0;
    let draws = 0;

    // Sort by date descending (most recent first)
    const sortedApiMatches = apiRawResponse.sort((a: any, b: any) => {
      const dateA = isCricket ? a.startDate : a.date;
      const dateB = isCricket ? b.startDate : b.date;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    for (let i = 0; i < Math.min(sortedApiMatches.length, 5); i++) {
      const apiMatch = sortedApiMatches[i];
      
      let score: { home: number; away: number };
      let cricketData: H2HMatch['cricketData'] = undefined;
      let basketballData: H2HMatch['basketballData'] = undefined;
      let volleyballData: H2HMatch['volleyballData'] = undefined;
      let hockeyData: H2HMatch['hockeyData'] = undefined;
      
      if (isCricket) {
        // Cricket-specific score parsing
        const cricketMatch = apiMatch as ApiCricketH2HMatch;
        const homeScoreStr = cricketMatch.state?.teams?.home?.score || '0/0';
        const awayScoreStr = cricketMatch.state?.teams?.away?.score || '0/0';
        const homeScore = parseCricketScore(homeScoreStr);
        const awayScore = parseCricketScore(awayScoreStr);
        
        // Use runs as the primary score for comparison
        score = { home: homeScore.runs, away: awayScore.runs };
        
        // Determine winner from report text
        const winner = determineCricketWinner(
          cricketMatch.state?.report || '',
          cricketMatch.homeTeam.name,
          cricketMatch.awayTeam.name,
          cricketMatch.homeTeam.abbreviation,
          cricketMatch.awayTeam.abbreviation
        );
        
        // Override score-based logic with report-based winner
        if (winner === 'home') {
          score = { home: 1, away: 0 };
        } else if (winner === 'away') {
          score = { home: 0, away: 1 };
        } else {
          score = { home: 0, away: 0 };
        }
        
        cricketData = {
          format: cricketMatch.format,
          homeScoreStr,
          awayScoreStr,
          report: cricketMatch.state?.report,
          overs: {
            home: cricketMatch.state?.teams?.home?.info || undefined,
            away: cricketMatch.state?.teams?.away?.info || undefined
          }
        };
      } else {
        // Standard football/american-football/rugby/baseball/basketball/hockey score parsing
        const standardMatch = apiMatch as ApiH2HMatch;
        const isRugby = sportEndpoint === 'rugby';
        const isBaseball = sportEndpoint === 'baseball';
        const isNbaBasketball = sportEndpoint === 'nba';
        const isGenericBasketball = sportEndpoint === 'basketball';
        const isNhlHockey = sportEndpoint === 'nhl';
        const isGenericHockey = sportEndpoint === 'hockey';
        
        // NBA format: state.score.homeTeam and awayTeam are arrays [Q1, Q2, Q3, Q4, OT?]
        if (isNbaBasketball) {
          const scoreData = standardMatch.state?.score as any;
          const homeScoreArr = scoreData?.homeTeam as number[] | undefined;
          const awayScoreArr = scoreData?.awayTeam as number[] | undefined;
          
          score = {
            home: parseNbaScoreArray(homeScoreArr),
            away: parseNbaScoreArray(awayScoreArr)
          };
          
          basketballData = parseNbaQuarters(homeScoreArr, awayScoreArr);
        } else if (isNhlHockey || isGenericHockey) {
          // NHL/Hockey: state.score.current for final score, with period scores
          const scoreStr = standardMatch.state?.score?.current;
          score = parseScore(scoreStr);
          
          // Parse period scores if available
          if (standardMatch.state?.score) {
            const scoreObj = standardMatch.state.score;
            hockeyData = {
              firstPeriod: scoreObj.firstPeriod ? parseScore(scoreObj.firstPeriod) : undefined,
              secondPeriod: scoreObj.secondPeriod ? parseScore(scoreObj.secondPeriod) : undefined,
              thirdPeriod: scoreObj.thirdPeriod ? parseScore(scoreObj.thirdPeriod) : undefined,
              overtimePeriod: scoreObj.overtimePeriod ? parseScore(scoreObj.overtimePeriod) : undefined,
            };
            // Only keep if at least one period exists
            if (!hockeyData.firstPeriod && !hockeyData.secondPeriod && !hockeyData.thirdPeriod && !hockeyData.overtimePeriod) {
              hockeyData = undefined;
            }
          }
        } else if (isRugby) {
          // Rugby: state.score is a string directly ("47 - 14")
          const rugbyScore = standardMatch.state?.score;
          const scoreStr = typeof rugbyScore === 'string' ? rugbyScore : rugbyScore?.current;
          score = parseScore(scoreStr);
        } else if (isBaseball) {
          // Baseball: state.score is object { home: {...}, away: {...}, current: "5 - 8" }
          const scoreStr = (standardMatch.state?.score as any)?.current;
          score = parseScore(scoreStr);
        } else if (isGenericBasketball) {
          // Generic basketball: state.score.current with q1, q2, q3, q4 strings
          const scoreStr = standardMatch.state?.score?.current;
          score = parseScore(scoreStr);
          
          if (standardMatch.state?.score) {
            const scoreObj = standardMatch.state.score;
            basketballData = {
              q1: scoreObj.q1 ? parseScore(scoreObj.q1) : undefined,
              q2: scoreObj.q2 ? parseScore(scoreObj.q2) : undefined,
              q3: scoreObj.q3 ? parseScore(scoreObj.q3) : undefined,
              q4: scoreObj.q4 ? parseScore(scoreObj.q4) : undefined,
              overTime: scoreObj.overTime ? parseScore(scoreObj.overTime) : undefined
            };
          }
        } else {
          // Football/American Football: state.score.current is the string
          const scoreStr = standardMatch.state?.score?.current;
          score = parseScore(scoreStr);
        }
        
        // Parse volleyball set scores
        const isVolleyball = sportEndpoint === 'volleyball';
        if (isVolleyball && standardMatch.state?.score) {
          const scoreObj = standardMatch.state.score;
          volleyballData = {
            set1: scoreObj.firstSet ? parseScore(scoreObj.firstSet) : undefined,
            set2: scoreObj.secondSet ? parseScore(scoreObj.secondSet) : undefined,
            set3: scoreObj.thirdSet ? parseScore(scoreObj.thirdSet) : undefined,
            set4: scoreObj.fourthSet ? parseScore(scoreObj.fourthSet) : undefined,
            set5: scoreObj.fifthSet ? parseScore(scoreObj.fifthSet) : undefined
          };
        }
      }

      // Determine winner relative to team_1 (ordered)
      const apiHomeHighId = isCricket 
        ? (apiMatch as ApiCricketH2HMatch).homeTeam.id 
        : (apiMatch as ApiH2HMatch).homeTeam.id;
        
      const apiHomeIsTeam1 = (apiHomeHighId == homeTeam.highlightly_id && isHomeTeamFirst) ||
                            (apiHomeHighId == awayTeam.highlightly_id && !isHomeTeamFirst);

      const team1Score = apiHomeIsTeam1 ? score.home : score.away;
      const team2Score = apiHomeIsTeam1 ? score.away : score.home;

      if (team1Score > team2Score) team1Wins++;
      else if (team2Score > team1Score) team2Wins++;
      else draws++;

      // Get match date
      const matchDate = isCricket 
        ? (apiMatch as ApiCricketH2HMatch).startDate 
        : (apiMatch as ApiH2HMatch).date;
      
      // Get highlightly_id
      const matchHighId = isCricket 
        ? (apiMatch as ApiCricketH2HMatch).id 
        : (apiMatch as ApiH2HMatch).id;

      // Upsert match
      const upsertPayload: Record<string, any> = {
        highlightly_id: matchHighId,
        date: matchDate,
        home_score: score.home,
        away_score: score.away,
        updated_at: new Date().toISOString()
      };
      
      // Add cricket-specific dates if applicable
      if (isCricket) {
        const cricketMatch = apiMatch as ApiCricketH2HMatch;
        upsertPayload.highlightly_dates = {
          startDate: cricketMatch.startDate,
          endDate: cricketMatch.endDate,
          startTime: cricketMatch.startTime
        };
      }

      const { data: upsertedMatch, error: upsertError } = await sportsDataClient
        .from('match')
        .upsert(upsertPayload, {
          onConflict: 'highlightly_id'
        })
        .select('id')
        .single();

      if (!upsertError && upsertedMatch) {
        matchIds[i] = upsertedMatch.id;
      }

      // Extract league info (handles string or object format)
      const leagueRaw = isCricket 
        ? (apiMatch as ApiCricketH2HMatch).league 
        : (apiMatch as ApiH2HMatch).league;
      const leagueInfo = extractLeagueInfo(leagueRaw);

      // Get team info
      const homeTeamData = isCricket 
        ? (apiMatch as ApiCricketH2HMatch).homeTeam 
        : (apiMatch as ApiH2HMatch).homeTeam;
      const awayTeamData = isCricket 
        ? (apiMatch as ApiCricketH2HMatch).awayTeam 
        : (apiMatch as ApiH2HMatch).awayTeam;

      // Transform for response
      transformedMatches.push({
        id: upsertedMatch?.id || crypto.randomUUID(),
        date: matchDate,
        homeTeam: {
          id: apiHomeHighId == homeTeam.highlightly_id ? homeTeamId! : awayTeamId!,
          name: getTeamName(homeTeamData as any),
          logo: homeTeamData.logo
        },
        awayTeam: {
          id: apiHomeHighId == awayTeam.highlightly_id ? homeTeamId! : awayTeamId!,
          name: getTeamName(awayTeamData as any),
          logo: awayTeamData.logo
        },
        homeScore: score.home,
        awayScore: score.away,
        competition: leagueInfo,
        cricketData,
        basketballData,
        volleyballData,
        hockeyData
      });
    }

    // Count all matches for summary
    for (let i = 5; i < sortedApiMatches.length; i++) {
      const apiMatch = sortedApiMatches[i];
      
      let score: { home: number; away: number };
      
      if (isCricket) {
        const cricketMatch = apiMatch as ApiCricketH2HMatch;
        const winner = determineCricketWinner(
          cricketMatch.state?.report || '',
          cricketMatch.homeTeam.name,
          cricketMatch.awayTeam.name,
          cricketMatch.homeTeam.abbreviation,
          cricketMatch.awayTeam.abbreviation
        );
        if (winner === 'home') score = { home: 1, away: 0 };
        else if (winner === 'away') score = { home: 0, away: 1 };
        else score = { home: 0, away: 0 };
      } else {
        const standardMatch = apiMatch as ApiH2HMatch;
        const isRugby = sportEndpoint === 'rugby';
        const isBaseball = sportEndpoint === 'baseball';
        const isNbaBasketball = sportEndpoint === 'nba';
        
        if (isNbaBasketball) {
          const scoreData = standardMatch.state?.score as any;
          const homeScoreArr = scoreData?.homeTeam as number[] | undefined;
          const awayScoreArr = scoreData?.awayTeam as number[] | undefined;
          score = {
            home: parseNbaScoreArray(homeScoreArr),
            away: parseNbaScoreArray(awayScoreArr)
          };
        } else if (isRugby) {
          const rugbyScore = standardMatch.state?.score;
          const scoreStr = typeof rugbyScore === 'string' ? rugbyScore : rugbyScore?.current;
          score = parseScore(scoreStr);
        } else if (isBaseball) {
          const scoreStr = (standardMatch.state?.score as any)?.current;
          score = parseScore(scoreStr);
        } else {
          const scoreStr = standardMatch.state?.score?.current;
          score = parseScore(scoreStr);
        }
      }
      
      const apiHomeHighId = isCricket 
        ? (apiMatch as ApiCricketH2HMatch).homeTeam.id 
        : (apiMatch as ApiH2HMatch).homeTeam.id;
        
      const apiHomeIsTeam1 = (apiHomeHighId == homeTeam.highlightly_id && isHomeTeamFirst) ||
                            (apiHomeHighId == awayTeam.highlightly_id && !isHomeTeamFirst);

      const team1Score = apiHomeIsTeam1 ? score.home : score.away;
      const team2Score = apiHomeIsTeam1 ? score.away : score.home;

      if (team1Score > team2Score) team1Wins++;
      else if (team2Score > team1Score) team2Wins++;
      else draws++;
    }

    // Step 6: Upsert h2h_records
    const { error: h2hError } = await sportsDataClient
      .from('h2h_records')
      .upsert({
        team_1_id: team1Id,
        team_2_id: team2Id,
        match_1_id: matchIds[0],
        match_2_id: matchIds[1],
        match_3_id: matchIds[2],
        match_4_id: matchIds[3],
        match_5_id: matchIds[4],
        total_matches: sortedApiMatches.length,
        team_1_wins: team1Wins,
        team_2_wins: team2Wins,
        draws: draws,
        last_fetched_at: new Date().toISOString()
      }, {
        onConflict: 'team_1_id,team_2_id'
      });

    if (h2hError) {
      console.error(`[fetch-h2h] H2H upsert error:`, h2hError);
    }

    // Return adjusted summary based on original request order
    const summary: H2HSummary = {
      homeWins: isHomeTeamFirst ? team1Wins : team2Wins,
      awayWins: isHomeTeamFirst ? team2Wins : team1Wins,
      draws,
      totalMatches: sortedApiMatches.length
    };

    return new Response(JSON.stringify({
      source: 'api',
      summary,
      matches: transformedMatches.slice(0, limit)
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("[fetch-h2h] Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", summary: null, matches: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
