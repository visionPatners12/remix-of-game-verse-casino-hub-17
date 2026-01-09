import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const H_KEY = Deno.env.get("HIGHLIGHTLY_KEY")!;
const H_BASE = Deno.env.get("HIGHLIGHTLY_BASE") ?? "https://sports.highlightly.net";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Sport-specific lineup endpoints
const LINEUP_ENDPOINTS: Record<string, string> = {
  'football': 'football',
  'baseball': 'baseball',
  'american-football': 'american-football',
  'basketball': 'nba',
  'hockey': 'nhl',
  'ice-hockey': 'nhl',
};

// Sport-specific timing rules for lineup availability
// NFL/NBA/NHL: Lineups available a few hours before game
// Football (soccer): Lineups available 30 min before or 15 min after kickoff
const LINEUP_TIMING_RULES: Record<string, { beforeMinutes: number; afterMinutes: number }> = {
  'football': { beforeMinutes: 30, afterMinutes: 15 },     // Soccer: 30 min before to 15 min after
  'american-football': { beforeMinutes: 180, afterMinutes: 60 }, // NFL: 3 hours before
  'basketball': { beforeMinutes: 180, afterMinutes: 60 },   // NBA: 3 hours before
  'hockey': { beforeMinutes: 180, afterMinutes: 60 },       // NHL: 3 hours before
  'ice-hockey': { beforeMinutes: 180, afterMinutes: 60 },   // NHL: 3 hours before
  'baseball': { beforeMinutes: 120, afterMinutes: 60 },     // MLB: 2 hours before
};

/**
 * Check if lineups should be available based on sport-specific timing rules
 * @returns { available: boolean, reason?: string }
 */
function checkLineupAvailability(sportSlug: string, startsAt: string | null): { available: boolean; reason?: string } {
  if (!startsAt) {
    // If no start time, allow fetch (better to try than block)
    return { available: true };
  }

  const now = new Date();
  const matchStart = new Date(startsAt);
  const diffMinutes = (matchStart.getTime() - now.getTime()) / (1000 * 60);
  
  const timing = LINEUP_TIMING_RULES[sportSlug] || LINEUP_TIMING_RULES['football'];
  
  // If match is too far in the future, lineups won't be available
  if (diffMinutes > timing.beforeMinutes) {
    const hoursUntilAvailable = Math.ceil((diffMinutes - timing.beforeMinutes) / 60);
    return { 
      available: false, 
      reason: `Lineups for ${sportSlug} become available ${timing.beforeMinutes} minutes before kickoff. Check back in ~${hoursUntilAvailable} hour(s).`
    };
  }
  
  // If match started long ago (past the after window), lineups should be cached
  // But we still allow fetch as they might be in cache
  if (diffMinutes < -timing.afterMinutes) {
    // Match is well underway or finished, lineups should be cached already
    // Allow fetch to return cached data
    return { available: true };
  }
  
  // Within the valid window
  return { available: true };
}

interface Player {
  id?: number;
  player_id?: string;
  name: string;
  number: number;
  position: string;
  positionAbbreviation?: string;
}

interface TeamLineup {
  teamId: string;
  name: string;
  logo: string;
  formation: string;
  initialLineup: Player[][];
  substitutes: Player[];
}

interface LineupResponse {
  source: 'cache' | 'api';
  matchId: string;
  homeTeam: TeamLineup | null;
  awayTeam: TeamLineup | null;
}

// Transform Baseball lineup (1D array with isStarter flag)
function transformBaseballLineup(apiLineup: any[]) {
  if (!apiLineup || !Array.isArray(apiLineup)) {
    return { initialLineup: [], substitutes: [] };
  }

  const mapPlayer = (p: any): Player => ({
    id: p.id,
    name: p.player || p.fullName || '',
    number: p.jersey || 0,
    position: p.position || '',
    positionAbbreviation: p.positionAbbreviation || '',
  });

  const starters = apiLineup.filter(p => p.isStarter).map(mapPlayer);
  const substitutes = apiLineup.filter(p => !p.isStarter).map(mapPlayer);

  return {
    initialLineup: starters,
    substitutes: substitutes,
  };
}

// Transform NBA/NHL lineup (uses "player" field instead of "fullName", "jersey" instead of "number")
// NHL API may not have isStarter field - treat all players as roster if missing
function transformNbaLineup(apiLineup: any[]) {
  if (!apiLineup || !Array.isArray(apiLineup)) {
    return { initialLineup: [], substitutes: [] };
  }

  const mapPlayer = (p: any): Player => ({
    id: p.id,
    name: p.player || p.fullName || p.name || '',
    number: p.jersey || p.shirtNumber || 0,
    position: p.position || '',
    positionAbbreviation: p.positionAbbreviation || '',
  });

  // Check if any player has isStarter defined (NBA has it, NHL may not)
  const hasStarterField = apiLineup.some(p => typeof p.isStarter === 'boolean');

  if (hasStarterField) {
    const starters = apiLineup.filter(p => p.isStarter).map(mapPlayer);
    const substitutes = apiLineup.filter(p => !p.isStarter).map(mapPlayer);
    return { initialLineup: starters, substitutes };
  } else {
    // No isStarter field (NHL) - all players are in the roster, no substitutes
    return { 
      initialLineup: apiLineup.map(mapPlayer), 
      substitutes: [] 
    };
  }
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    let stgAzuroId = url.searchParams.get("stgAzuroId");
    
    console.log(`[fetch-match-lineup] Method: ${req.method}, URL stgAzuroId: ${stgAzuroId}`);

    // Support body JSON for any method (supabase.functions.invoke uses POST)
    if (!stgAzuroId) {
      try {
        const body = await req.json();
        console.log(`[fetch-match-lineup] Body received:`, JSON.stringify(body));
        stgAzuroId = body.stgAzuroId;
      } catch (e) {
        console.log(`[fetch-match-lineup] No JSON body or parse error:`, e);
      }
    }

    if (!stgAzuroId) {
      console.error("[fetch-match-lineup] Missing stgAzuroId parameter after all checks");
      return new Response(
        JSON.stringify({ error: "Missing stgAzuroId parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[fetch-match-lineup] Received request for stgAzuroId: ${stgAzuroId}`);

    // Create sports_data schema client (stg_azuro_games and match are in sports_data)
    const sportsDataClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      db: { schema: 'sports_data' }
    });

    // Step 1: Resolve stgAzuroId to match details
    // stg_azuro_games is in sports_data schema
    const { data: stgGame, error: stgError } = await sportsDataClient
      .from('stg_azuro_games')
      .select('id, match_id, home, away, league')
      .eq('id', stgAzuroId)
      .single();

    if (stgError || !stgGame) {
      console.error(`[fetch-match-lineup] stg_azuro_games not found for id: ${stgAzuroId}`, stgError);
      return new Response(
        JSON.stringify({ error: "Match not found in staging", details: stgError?.message }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[fetch-match-lineup] Found stg_azuro_games: match_id=${stgGame.match_id}`);

    if (!stgGame.match_id) {
      console.error(`[fetch-match-lineup] No match_id linked for stgAzuroId: ${stgAzuroId}`);
      return new Response(
        JSON.stringify({ error: "Match not linked to sports_data.match yet" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Get match details from sports_data.match with sport info and starts_at
    const { data: match, error: matchError } = await sportsDataClient
      .from('match')
      .select(`
        id,
        highlightly_id,
        sport_id,
        home_team_id,
        away_team_id,
        starts_at,
        home_team:teams!match_home_team_id_fkey(id, name, logo),
        away_team:teams!match_away_team_id_fkey(id, name, logo),
        sport:sport!match_sport_id_fkey(id, slug)
      `)
      .eq('id', stgGame.match_id)
      .single();

    if (matchError || !match) {
      console.error(`[fetch-match-lineup] sports_data.match not found for id: ${stgGame.match_id}`, matchError);
      return new Response(
        JSON.stringify({ error: "Match not found in sports_data", details: matchError?.message }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Detect sport type
    const sportSlug = (match.sport as any)?.slug || 'football';
    const isBaseball = sportSlug === 'baseball';
    const isAmericanFootball = sportSlug === 'american-football';
    const isBasketball = sportSlug === 'basketball';
    const isHockey = sportSlug === 'hockey' || sportSlug === 'ice-hockey';
    const isFlatLineupSport = isBaseball || isAmericanFootball || isBasketball || isHockey;

    console.log(`[fetch-match-lineup] Found match: highlightly_id=${match.highlightly_id}, sport=${sportSlug}, starts_at=${match.starts_at}, home_team_id=${match.home_team_id}, away_team_id=${match.away_team_id}`);

    // Step 3: Check cache in sports_data.lineups
    const { data: cachedLineups, error: cacheError } = await sportsDataClient
      .from('lineups')
      .select('*')
      .eq('match_id', match.id);

    // Validate cache has actual data (not empty arrays)
    const hasValidCache = !cacheError && cachedLineups && cachedLineups.length > 0 && 
      cachedLineups.some(l => {
        const initialLineup = l.initial_lineup;
        const substitutes = l.substitutes;
        // Check if initialLineup has actual players (could be 1D or 2D array)
        const hasInitialPlayers = Array.isArray(initialLineup) && (
          initialLineup.length > 0 && (
            // 1D array of players
            (typeof initialLineup[0] === 'object' && !Array.isArray(initialLineup[0])) ||
            // 2D array of players (formation rows)
            (Array.isArray(initialLineup[0]) && initialLineup[0].length > 0)
          )
        );
        const hasSubstitutes = Array.isArray(substitutes) && substitutes.length > 0;
        return hasInitialPlayers || hasSubstitutes;
      });

    if (hasValidCache) {
      console.log(`[fetch-match-lineup] Found ${cachedLineups.length} valid cached lineups for match_id: ${match.id}`);
      
      const homeLineup = cachedLineups.find(l => l.side === 'home');
      const awayLineup = cachedLineups.find(l => l.side === 'away');

      const response: LineupResponse = {
        source: 'cache',
        matchId: match.id,
        homeTeam: homeLineup ? {
          teamId: homeLineup.team_id,
          name: (match.home_team as any)?.name || stgGame.home || 'Home',
          logo: (match.home_team as any)?.logo || '',
          formation: homeLineup.formation || '',
          initialLineup: homeLineup.initial_lineup || [],
          substitutes: homeLineup.substitutes || []
        } : null,
        awayTeam: awayLineup ? {
          teamId: awayLineup.team_id,
          name: (match.away_team as any)?.name || stgGame.away || 'Away',
          logo: (match.away_team as any)?.logo || '',
          formation: awayLineup.formation || '',
          initialLineup: awayLineup.initial_lineup || [],
          substitutes: awayLineup.substitutes || []
        } : null
      };

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    // If cache exists but is empty, delete it so we can refetch
    if (!cacheError && cachedLineups && cachedLineups.length > 0 && !hasValidCache) {
      console.log(`[fetch-match-lineup] Found empty cached lineups, deleting stale cache for match_id: ${match.id}`);
      await sportsDataClient
        .from('lineups')
        .delete()
        .eq('match_id', match.id);
    }

    // Step 4: Check timing rules before calling API
    const timingCheck = checkLineupAvailability(sportSlug, match.starts_at);
    if (!timingCheck.available) {
      console.log(`[fetch-match-lineup] Lineups not yet available: ${timingCheck.reason}`);
      return new Response(
        JSON.stringify({ 
          error: "Lineups not yet available", 
          reason: timingCheck.reason,
          matchId: match.id,
          startsAt: match.starts_at,
          sport: sportSlug
        }),
        { status: 204, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 5: No cache, need to call Highlightly API
    if (!match.highlightly_id) {
      console.log(`[fetch-match-lineup] No highlightly_id for match, cannot fetch lineups`);
      return new Response(
        JSON.stringify({ 
          error: "Lineups not available", 
          reason: "Match has no highlightly_id linked",
          matchId: match.id
        }),
        { status: 204, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[fetch-match-lineup] Fetching lineups from Highlightly API for id: ${match.highlightly_id}`);

    // Use sport-specific endpoint
    const sportEndpoint = LINEUP_ENDPOINTS[sportSlug] || 'football';
    const apiUrl = `${H_BASE}/${sportEndpoint}/lineups/${match.highlightly_id}`;
    console.log(`[fetch-match-lineup] API URL: ${apiUrl}`);

    const apiResponse = await fetch(apiUrl, {
      headers: { "x-rapidapi-key": H_KEY }
    });

    if (!apiResponse.ok) {
      console.error(`[fetch-match-lineup] Highlightly API error: ${apiResponse.status} ${apiResponse.statusText}`);
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch lineups from provider", 
          status: apiResponse.status,
          matchId: match.id
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiData = await apiResponse.json();
    
    // Baseball/American Football uses { home: { team, lineup }, away: { team, lineup } }
    // Football uses { homeTeam: {...}, awayTeam: {...} }
    const hasHomeData = isFlatLineupSport ? apiData.home?.lineup : apiData.homeTeam;
    const hasAwayData = isFlatLineupSport ? apiData.away?.lineup : apiData.awayTeam;
    
    console.log(`[fetch-match-lineup] Received API response with home: ${!!hasHomeData}, away: ${!!hasAwayData}`);

    if (!hasHomeData && !hasAwayData) {
      console.log(`[fetch-match-lineup] Lineups not yet available for this match`);
      return new Response(
        JSON.stringify({ 
          error: "Lineups not yet available", 
          reason: "Match lineups have not been announced yet",
          matchId: match.id
        }),
        { status: 204, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 5: Transform and insert lineups
    const lineupsToInsert = [];

    if (isFlatLineupSport) {
      // Baseball/American Football/Basketball/Hockey structure: { home: { team, lineup }, away: { team, lineup } }
      if (apiData.home?.lineup && match.home_team_id) {
        const transformed = (isBasketball || isHockey)
          ? transformNbaLineup(apiData.home.lineup)
          : transformBaseballLineup(apiData.home.lineup);
        lineupsToInsert.push({
          match_id: match.id,
          team_id: match.home_team_id,
          sport_id: match.sport_id,
          side: 'home',
          formation: null, // No formation in these sports
          initial_lineup: transformed.initialLineup,
          substitutes: transformed.substitutes,
          provider: 'highlightly',
          provider_lineup_id: match.highlightly_id
        });
      }

      if (apiData.away?.lineup && match.away_team_id) {
        const transformed = (isBasketball || isHockey)
          ? transformNbaLineup(apiData.away.lineup)
          : transformBaseballLineup(apiData.away.lineup);
        lineupsToInsert.push({
          match_id: match.id,
          team_id: match.away_team_id,
          sport_id: match.sport_id,
          side: 'away',
          formation: null,
          initial_lineup: transformed.initialLineup,
          substitutes: transformed.substitutes,
          provider: 'highlightly',
          provider_lineup_id: match.highlightly_id
        });
      }
    } else {
      // Football structure: { homeTeam, awayTeam }
      if (apiData.homeTeam && match.home_team_id) {
        lineupsToInsert.push({
          match_id: match.id,
          team_id: match.home_team_id,
          sport_id: match.sport_id,
          side: 'home',
          formation: apiData.homeTeam.formation || null,
          initial_lineup: apiData.homeTeam.initialLineup || [],
          substitutes: apiData.homeTeam.substitutes || [],
          provider: 'highlightly',
          provider_lineup_id: match.highlightly_id
        });
      }

      if (apiData.awayTeam && match.away_team_id) {
        lineupsToInsert.push({
          match_id: match.id,
          team_id: match.away_team_id,
          sport_id: match.sport_id,
          side: 'away',
          formation: apiData.awayTeam.formation || null,
          initial_lineup: apiData.awayTeam.initialLineup || [],
          substitutes: apiData.awayTeam.substitutes || [],
          provider: 'highlightly',
          provider_lineup_id: match.highlightly_id
        });
      }
    }

    if (lineupsToInsert.length > 0) {
      console.log(`[fetch-match-lineup] Inserting ${lineupsToInsert.length} lineups into DB`);
      
      const { data: insertedLineups, error: insertError } = await sportsDataClient
        .from('lineups')
        .upsert(lineupsToInsert, { 
          onConflict: 'match_id,side',
          ignoreDuplicates: false 
        })
        .select();

      if (insertError) {
        console.error(`[fetch-match-lineup] Error inserting lineups:`, insertError);
        // Continue anyway, return API data
      } else {
        console.log(`[fetch-match-lineup] Successfully inserted/updated lineups`);
      }
    }

    // Step 6: Return response
    let response: LineupResponse;

    if (isFlatLineupSport) {
      const homeTransformed = apiData.home?.lineup 
        ? ((isBasketball || isHockey) ? transformNbaLineup(apiData.home.lineup) : transformBaseballLineup(apiData.home.lineup))
        : null;
      const awayTransformed = apiData.away?.lineup 
        ? ((isBasketball || isHockey) ? transformNbaLineup(apiData.away.lineup) : transformBaseballLineup(apiData.away.lineup))
        : null;

      response = {
        source: 'api',
        matchId: match.id,
        homeTeam: apiData.home ? {
          teamId: match.home_team_id || '',
          name: apiData.home.team?.displayName || apiData.home.team?.name || (match.home_team as any)?.name || stgGame.home || 'Home',
          logo: apiData.home.team?.logo || (match.home_team as any)?.logo || '',
          formation: '',
          initialLineup: homeTransformed ? [homeTransformed.initialLineup] : [], // Wrap in 2D for compatibility
          substitutes: homeTransformed?.substitutes || []
        } : null,
        awayTeam: apiData.away ? {
          teamId: match.away_team_id || '',
          name: apiData.away.team?.displayName || apiData.away.team?.name || (match.away_team as any)?.name || stgGame.away || 'Away',
          logo: apiData.away.team?.logo || (match.away_team as any)?.logo || '',
          formation: '',
          initialLineup: awayTransformed ? [awayTransformed.initialLineup] : [],
          substitutes: awayTransformed?.substitutes || []
        } : null
      };
    } else {
      response = {
        source: 'api',
        matchId: match.id,
        homeTeam: apiData.homeTeam ? {
          teamId: match.home_team_id || '',
          name: apiData.homeTeam.name || (match.home_team as any)?.name || stgGame.home || 'Home',
          logo: apiData.homeTeam.logo || (match.home_team as any)?.logo || '',
          formation: apiData.homeTeam.formation || '',
          initialLineup: apiData.homeTeam.initialLineup || [],
          substitutes: apiData.homeTeam.substitutes || []
        } : null,
        awayTeam: apiData.awayTeam ? {
          teamId: match.away_team_id || '',
          name: apiData.awayTeam.name || (match.away_team as any)?.name || stgGame.away || 'Away',
          logo: apiData.awayTeam.logo || (match.away_team as any)?.logo || '',
          formation: apiData.awayTeam.formation || '',
          initialLineup: apiData.awayTeam.initialLineup || [],
          substitutes: apiData.awayTeam.substitutes || []
        } : null
      };
    }

    console.log(`[fetch-match-lineup] Returning API data for match_id: ${match.id}`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("[fetch-match-lineup] Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
