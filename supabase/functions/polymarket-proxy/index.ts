import { corsHeaders } from '../_shared/cors.ts';

interface PolymarketRequest {
  endpoint?: string;
  params?: Record<string, string | number | boolean>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Polymarket proxy request received:', req.method, req.url);

    // Parse request body for POST requests, or use query params for GET
    let requestData: PolymarketRequest = {};
    
    if (req.method === 'POST') {
      requestData = await req.json();
    } else if (req.method === 'GET') {
      const url = new URL(req.url);
      const endpoint = url.searchParams.get('endpoint') || '/events';
      const params: Record<string, string | number | boolean> = {};
      
      // Extract query parameters
      for (const [key, value] of url.searchParams.entries()) {
        if (key !== 'endpoint') {
          // Try to parse as number or boolean
          if (value === 'true') params[key] = true;
          else if (value === 'false') params[key] = false;
          else if (!isNaN(Number(value))) params[key] = Number(value);
          else params[key] = value;
        }
      }
      
      requestData = { endpoint, params };
    }

    const { endpoint = '/events', params = {} } = requestData;

    // Force default parameters for events endpoint
    if (endpoint === '/events') {
      params.active = true;
      params.closed = false;
    }

    // Build Polymarket API URL
    const polymarketUrl = new URL(`https://gamma-api.polymarket.com${endpoint}`);
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      polymarketUrl.searchParams.append(key, String(value));
    });

    console.log('Making request to Polymarket API:', polymarketUrl.toString());

    // Make request to Polymarket API
    const response = await fetch(polymarketUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Lovable-App/1.0',
      },
    });

    if (!response.ok) {
      console.error('Polymarket API error:', response.status, response.statusText);
      throw new Error(`Polymarket API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Polymarket API response received, data length:', Array.isArray(data) ? data.length : 'not array');

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Polymarket proxy error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch from Polymarket API',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});