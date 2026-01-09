import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

interface BoxScoreResponse {
  source: 'cache' | 'api';
  matchId: string;
  homeTeam: TeamBoxScore | null;
  awayTeam: TeamBoxScore | null;
}

interface TeamBoxScore {
  team: { id: number; name: string; logo: string };
  players: BoxScorePlayer[];
}

interface BoxScorePlayer {
  id: number;
  name: string;
  fullName: string;
  logo: string;
  matchRating: string;
  shirtNumber: number;
  isCaptain: boolean;
  position: string;
  minutesPlayed: number;
  isSubstitute: boolean;
  offsides: number;
  statistics: Record<string, unknown>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request
    let stgAzuroId: string | null = null;
    
    if (req.method === 'POST') {
      const body = await req.json();
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

    console.log(`[fetch-match-boxscore] Processing stgAzuroId: ${stgAzuroId}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Resolve stgAzuroId (azuro_game_id) to match_id
    const { data: stgGame, error: stgError } = await supabase
      .schema('sports_data')
      .from('stg_azuro_games')
      .select('match_id')
      .eq('azuro_game_id', stgAzuroId)
      .single();

    if (stgError || !stgGame?.match_id) {
      console.error(`[fetch-match-boxscore] stg_azuro_games lookup failed:`, stgError);
      return new Response(
        JSON.stringify({ error: 'Match not found in stg_azuro_games', stgAzuroId }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const matchId = stgGame.match_id;
    console.log(`[fetch-match-boxscore] Resolved match_id: ${matchId}`);

    // Step 2: Get match details including highlightly_id and team info
    const { data: match, error: matchError } = await supabase
      .schema('sports_data')
      .from('match')
      .select(`
        id,
        highlightly_id,
        home_team_id,
        away_team_id,
        home_team_highlightly_id,
        away_team_highlightly_id,
        home_team:teams!match_home_team_id_fkey(id, name, logo, highlightly_id),
        away_team:teams!match_away_team_id_fkey(id, name, logo, highlightly_id)
      `)
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      console.error(`[fetch-match-boxscore] Match lookup failed:`, matchError);
      return new Response(
        JSON.stringify({ error: 'Match not found', matchId }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!match.highlightly_id) {
      console.log(`[fetch-match-boxscore] No highlightly_id for match ${matchId}`);
      return new Response(
        JSON.stringify({ error: 'Match has no highlightly_id', matchId }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[fetch-match-boxscore] Match found: highlightly_id=${match.highlightly_id}`);

    // Step 3: Check if box score data already exists (no TTL - permanent cache)
    const { data: existingBoxScore, error: cacheError } = await supabase
      .schema('sports_data')
      .from('match_boxscore')
      .select('*')
      .eq('match_id', matchId);

    if (!cacheError && existingBoxScore && existingBoxScore.length > 0) {
      console.log(`[fetch-match-boxscore] Cache hit: found ${existingBoxScore.length} team records`);
      
      // Format response from cache
      const homeRecord = existingBoxScore.find(r => 
        r.team_provider_id === match.home_team_highlightly_id ||
        r.team_id === match.home_team_id
      );
      const awayRecord = existingBoxScore.find(r => 
        r.team_provider_id === match.away_team_highlightly_id ||
        r.team_id === match.away_team_id
      );

      const response: BoxScoreResponse = {
        source: 'cache',
        matchId: matchId,
        homeTeam: homeRecord ? {
          team: { id: homeRecord.team_provider_id, name: homeRecord.team_name, logo: homeRecord.team_logo || '' },
          players: homeRecord.players as BoxScorePlayer[]
        } : null,
        awayTeam: awayRecord ? {
          team: { id: awayRecord.team_provider_id, name: awayRecord.team_name, logo: awayRecord.team_logo || '' },
          players: awayRecord.players as BoxScorePlayer[]
        } : null
      };

      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 4: Fetch from API
    const highlightlyKey = Deno.env.get('HIGHLIGHTLY_KEY');
    const highlightlyBase = Deno.env.get('HIGHLIGHTLY_BASE') || 'https://sports.highlightly.net';

    if (!highlightlyKey) {
      console.error(`[fetch-match-boxscore] HIGHLIGHTLY_KEY not configured`);
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Detect sport from match data - need to fetch sport info
    const { data: matchWithSport } = await supabase
      .schema('sports_data')
      .from('stg_azuro_games')
      .select('payload, league_azuro_slug')
      .eq('match_id', matchId)
      .single();
    
    const sportSlug = matchWithSport?.payload?.sport?.slug || 'football';
    const leagueSlug = matchWithSport?.league_azuro_slug || '';
    
    // Determine the correct API endpoint based on sport
    const NBA_TIER_LEAGUES = ['nba', 'ncaa', 'nba-g-league', 'nba-summer-league', 'nba-cup'];
    const isHockey = sportSlug === 'hockey' || sportSlug === 'ice-hockey';
    const isBasketball = sportSlug === 'basketball';
    const isNbaTier = isBasketball && NBA_TIER_LEAGUES.some(l => leagueSlug.toLowerCase().includes(l));
    
    let sportEndpoint: string;
    if (isHockey) {
      sportEndpoint = 'nhl';
    } else if (isNbaTier) {
      sportEndpoint = 'nba';
    } else if (isBasketball) {
      sportEndpoint = 'basketball';
    } else {
      sportEndpoint = 'football';
    }
    
    const apiUrl = `${highlightlyBase}/${sportEndpoint}/box-score/${match.highlightly_id}`;
    console.log(`[fetch-match-boxscore] Fetching from API: ${apiUrl} (sport: ${sportSlug})`);

    const apiResponse = await fetch(apiUrl, {
      headers: {
        'x-rapidapi-key': highlightlyKey,
        'Accept': 'application/json'
      }
    });

    if (!apiResponse.ok) {
      console.error(`[fetch-match-boxscore] API error: ${apiResponse.status}`);
      return new Response(
        JSON.stringify({ error: `API error: ${apiResponse.status}` }),
        { status: apiResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiData = await apiResponse.json();
    console.log(`[fetch-match-boxscore] API response received, teams: ${apiData?.length || 0}`);

    if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No box score data available', matchId }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 5: Parse and store data
    const homeTeamProviderId = match.home_team_highlightly_id;
    const awayTeamProviderId = match.away_team_highlightly_id;

    let homeTeamData: TeamBoxScore | null = null;
    let awayTeamData: TeamBoxScore | null = null;

    for (const teamData of apiData) {
      const teamId = teamData.team?.id;
      const teamName = teamData.team?.displayName || teamData.team?.name || 'Unknown';
      const teamLogo = teamData.team?.logo || '';
      const players = teamData.players || [];

      // Map players to our structure
      const mappedPlayers: BoxScorePlayer[] = players.map((p: Record<string, unknown>) => ({
        id: p.id as number,
        name: p.name as string || '',
        fullName: p.fullName as string || p.name as string || '',
        logo: p.logo as string || '',
        matchRating: p.matchRating as string || '0',
        shirtNumber: p.shirtNumber as number || 0,
        isCaptain: p.isCaptain as boolean || false,
        position: p.position as string || '',
        minutesPlayed: p.minutesPlayed as number || 0,
        isSubstitute: p.isSubstitute as boolean || false,
        offsides: p.offsides as number || 0,
        statistics: p.statistics as Record<string, unknown> || {}
      }));

      const boxScore: TeamBoxScore = {
        team: { id: teamId, name: teamName, logo: teamLogo },
        players: mappedPlayers
      };

      // Determine if home or away
      const isHome = teamId === homeTeamProviderId;
      const isAway = teamId === awayTeamProviderId;

      if (isHome) {
        homeTeamData = boxScore;
      } else if (isAway) {
        awayTeamData = boxScore;
      } else if (!homeTeamData) {
        // Fallback: first team is home
        homeTeamData = boxScore;
      } else if (!awayTeamData) {
        // Fallback: second team is away
        awayTeamData = boxScore;
      }

      // Upsert to database
      const dbTeamId = isHome ? match.home_team_id : (isAway ? match.away_team_id : null);
      
      const { error: upsertError } = await supabase
        .schema('sports_data')
        .from('match_boxscore')
        .upsert({
          match_id: matchId,
          team_id: dbTeamId,
          team_provider_id: teamId,
          team_name: teamName,
          team_logo: teamLogo,
          players: mappedPlayers,
          raw_data: teamData,
          provider: 'highlightly',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'match_id,team_provider_id'
        });

      if (upsertError) {
        console.error(`[fetch-match-boxscore] Upsert error:`, upsertError);
      } else {
        console.log(`[fetch-match-boxscore] Stored box score for team ${teamName}`);
      }
    }

    // Step 6: Return response
    const response: BoxScoreResponse = {
      source: 'api',
      matchId: matchId,
      homeTeam: homeTeamData,
      awayTeam: awayTeamData
    };

    console.log(`[fetch-match-boxscore] Returning data from API`);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`[fetch-match-boxscore] Unexpected error:`, error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
