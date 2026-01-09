import { corsHeaders } from '../_shared/cors.ts';

const BASE = 'https://v3.football.api-sports.io';

interface LeagueData {
  season: number;
  inserted: number;
  updated: number;
  skipped: number;
}

function slugify(s: string): string {
  return s
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function getJSON(url: string, apiKey: string): Promise<any> {
  const response = await fetch(url, { 
    headers: { 
      'x-apisports-key': apiKey,
      'x-apisports-host': 'v3.football.api-sports.io'
    } 
  });
  
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} on ${url}`);
  }
  
  return response.json();
}

/**
 * Importe/MAJ les ligues pour une saison.
 * Identification: (slug, country_slug). `api_sport_id` = id renvoyé par l'API.
 */
async function syncLeaguesBySeason(season: number, supabase: any, apiKey: string): Promise<LeagueData> {
  let page = 1;
  let inserted = 0, updated = 0, skipped = 0;

  while (true) {
    const url = `${BASE}/leagues?season=${season}&page=${page}`;
    console.log(`Fetching leagues for season ${season}, page ${page}`);
    
    const data: any = await getJSON(url, apiKey);

    for (const row of (data?.response ?? [])) {
      const league = row?.league;
      const country = row?.country;

      const apiId = league?.id;
      const name = league?.name as string | undefined;
      const logo = league?.logo as string | undefined;
      const countryName = (country?.name as string | undefined) || 'unknown';

      if (!apiId || !name) { 
        skipped++; 
        continue; 
      }

      const slug = slugify(name);
      const country_slug = slugify(countryName);

      // upsert basé sur (slug, country_slug)
      const { data: existing, error: selErr } = await supabase
        .from('leagues')
        .select('id')
        .eq('slug', slug)
        .eq('country_slug', country_slug)
        .limit(1);
        
      if (selErr) throw selErr;

      const { error: upErr } = await supabase
        .from('leagues')
        .upsert([{
          slug,
          country_slug,
          name,
          sport: 'football',
          image: logo ?? null,
          api_sport_id: apiId,     // = id de l'API, tel quel
        }], { onConflict: 'slug,country_slug' });
        
      if (upErr) throw upErr;

      if (existing?.length) updated++; else inserted++;
    }

    const cur = data?.paging?.current ?? page;
    const tot = data?.paging?.total ?? page;
    if (cur >= tot) break;
    page++;
  }

  return { season, inserted, updated, skipped };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get API key from environment variables
    const apiKey = Deno.env.get('RAPIDAPI_KEY');
    if (!apiKey) {
      console.error('RAPIDAPI_KEY not found in environment variables');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get Supabase credentials
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase credentials not found');
      return new Response(
        JSON.stringify({ error: 'Supabase credentials not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Supabase client
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request data
    let requestData: { season?: number } = {};
    
    if (req.method === 'POST') {
      try {
        requestData = await req.json();
      } catch (error) {
        console.error('Error parsing POST body:', error);
        return new Response(
          JSON.stringify({ error: 'Invalid JSON in request body' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    } else if (req.method === 'GET') {
      const url = new URL(req.url);
      const seasonParam = url.searchParams.get('season');
      if (seasonParam) {
        requestData.season = parseInt(seasonParam, 10);
      }
    }

    // Validate season parameter
    const season = requestData.season || new Date().getFullYear();
    if (isNaN(season) || season < 1900 || season > 2100) {
      return new Response(
        JSON.stringify({ error: 'Invalid season parameter' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Starting league synchronization for season ${season}`);

    // Sync leagues
    const result = await syncLeaguesBySeason(season, supabase, apiKey);
    
    console.log(`League sync completed:`, result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in sync-leagues-by-season:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: String(error) 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});