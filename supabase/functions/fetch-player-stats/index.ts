import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map sports to Highlightly endpoints
const SPORT_ENDPOINTS: Record<string, string> = {
  'basketball': 'nba',
  'football': 'football',
  'soccer': 'football',
  'american-football': 'american-football',
  'hockey': 'nhl',
  'baseball': 'baseball',
};

// Sports that use perSeason format (like basketball)
const SPORTS_WITH_PER_SEASON = ['nba', 'american-football', 'nhl', 'baseball'];

const CACHE_TTL_HOURS = 24;

interface PlayerStatsRequest {
  playerId: string;
  sport?: string;
  forceRefresh?: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const highlightlyApiKey = Deno.env.get('HIGHLIGHTLY_KEY');
    
    if (!highlightlyApiKey) {
      return new Response(
        JSON.stringify({ error: 'HIGHLIGHTLY_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      db: { schema: 'sports_data' },
    });

    const { playerId, sport = 'basketball', forceRefresh = false }: PlayerStatsRequest = await req.json();

    console.log('fetch-player-stats - Request:', { playerId, sport, forceRefresh });

    if (!playerId) {
      return new Response(
        JSON.stringify({ error: 'playerId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Check cache in database
    const { data: player, error: fetchError } = await supabase
      .from('players')
      .select('per_season, stats_last_fetched_at, provider_id')
      .eq('id', playerId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching player from DB:', fetchError);
      throw fetchError;
    }

    if (!player) {
      return new Response(
        JSON.stringify({ error: 'Player not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!player.provider_id) {
      console.error('Player missing provider_id:', playerId);
      return new Response(
        JSON.stringify({ error: 'Player missing provider_id required for API lookup' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('fetch-player-stats - Using provider_id:', player.provider_id);

    const sportEndpoint = SPORT_ENDPOINTS[sport.toLowerCase()] || 'nba';

    // 2. Check if cache is fresh (< 24h) and not forcing refresh
    const now = new Date();
    const lastFetched = player.stats_last_fetched_at ? new Date(player.stats_last_fetched_at) : null;
    const cacheAge = lastFetched ? (now.getTime() - lastFetched.getTime()) / (1000 * 60 * 60) : null;
    const isCacheFresh = cacheAge !== null && cacheAge < CACHE_TTL_HOURS;

    // Check if cache actually contains valid data (not empty array or empty object)
    const hasCachedData = player.per_season && (
      Array.isArray(player.per_season) 
        ? player.per_season.length > 0 
        : (player.per_season.perCompetition?.length > 0 || player.per_season.perClub?.length > 0)
    );

    console.log('fetch-player-stats - Cache check:', { 
      hasCachedData, 
      isCacheFresh, 
      forceRefresh,
      cacheAge: cacheAge?.toFixed(2),
      perSeasonType: Array.isArray(player.per_season) ? 'array' : typeof player.per_season
    });

    if (!forceRefresh && isCacheFresh && hasCachedData) {
      console.log(`fetch-player-stats - Cache hit (age: ${cacheAge?.toFixed(2)}h)`);
      return new Response(
        JSON.stringify({
          source: 'cache',
          lastFetched: player.stats_last_fetched_at,
          cacheAgeHours: cacheAge,
          data: player.per_season,
          sport: sportEndpoint,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Cache miss or stale - fetch from Highlightly API directly
    console.log(`fetch-player-stats - Cache ${!lastFetched ? 'empty' : 'stale'} (age: ${cacheAge?.toFixed(2)}h), fetching from API`);
    
    const highlightlyUrl = `https://sports.highlightly.net/${sportEndpoint}/players/${player.provider_id}/statistics`;

    console.log('fetch-player-stats - Calling Highlightly API:', highlightlyUrl);

    const highlightlyResponse = await fetch(highlightlyUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': highlightlyApiKey,
        'Accept': 'application/json',
      },
    });

    if (!highlightlyResponse.ok) {
      console.error('Highlightly API error:', highlightlyResponse.status, highlightlyResponse.statusText);
      
      // If API fails, return cached data if available
      if (player.per_season) {
        console.log('fetch-player-stats - API failed, returning stale cache');
        return new Response(
          JSON.stringify({
            source: 'cache',
            lastFetched: player.stats_last_fetched_at,
            cacheAgeHours: cacheAge,
            data: player.per_season || [],
            warning: 'API unavailable, showing cached data',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`Highlightly API error: ${highlightlyResponse.status}`);
    }

    const highlightlyData = await highlightlyResponse.json();
    
    // The API returns an array of player objects - take the first one
    const playerData = Array.isArray(highlightlyData) ? highlightlyData[0] : highlightlyData;
    
    // Handle different data structures based on sport
    // Football (soccer) uses perCompetition/perClub, others use perSeason
    const usesPerSeason = SPORTS_WITH_PER_SEASON.includes(sportEndpoint);
    const perSeasonData = playerData?.perSeason || [];
    const perCompetitionData = playerData?.perCompetition || [];
    const perClubData = playerData?.perClub || [];
    
    console.log('fetch-player-stats - Player stats received:', {
      playerId: playerData?.id,
      playerName: playerData?.fullName,
      sport: sportEndpoint,
      usesPerSeason,
      seasonsCount: perSeasonData.length,
      competitionsCount: perCompetitionData.length,
      clubsCount: perClubData.length,
      isArrayResponse: Array.isArray(highlightlyData)
    });

    // 4. Update database with raw stats (structure depends on sport)
    const statsData = usesPerSeason 
      ? perSeasonData
      : { name: playerData?.name, perCompetition: perCompetitionData, perClub: perClubData };

    const { error: updateError } = await supabase
      .from('players')
      .update({
        per_season: statsData,
        stats_last_fetched_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq('id', playerId);

    if (updateError) {
      console.error('Error updating player stats in DB:', updateError);
      // Continue anyway, we have the data
    } else {
      console.log('fetch-player-stats - Database updated successfully');
    }

    // 5. Return raw data (structure depends on sport)
    return new Response(
      JSON.stringify({
        source: 'api',
        lastFetched: now.toISOString(),
        cacheAgeHours: 0,
        data: statsData,
        sport: sportEndpoint,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-player-stats function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'Check edge function logs for more information'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
