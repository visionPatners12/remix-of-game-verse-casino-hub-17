import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const INDEXNOW_KEY = Deno.env.get('INDEXNOW_KEY') || 'pryzen-indexnow-key';
const HOST = 'pryzen.io';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { urls, urlList } = await req.json();
    const urlsToSubmit = urls || urlList;

    if (!urlsToSubmit || !Array.isArray(urlsToSubmit) || urlsToSubmit.length === 0) {
      console.error('[IndexNow] No URLs provided');
      return new Response(
        JSON.stringify({ error: 'No URLs provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate URLs belong to our domain
    const validUrls = urlsToSubmit.filter((url: string) => {
      try {
        const parsed = new URL(url);
        return parsed.hostname === HOST || parsed.hostname === `www.${HOST}`;
      } catch {
        return false;
      }
    });

    if (validUrls.length === 0) {
      console.error('[IndexNow] No valid URLs for domain:', HOST);
      return new Response(
        JSON.stringify({ error: 'No valid URLs for domain' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[IndexNow] Submitting ${validUrls.length} URLs to IndexNow`);

    // Submit to IndexNow (Bing, Yandex, etc.)
    const indexNowPayload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
      urlList: validUrls
    };

    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(indexNowPayload)
    });

    const status = response.status;
    console.log(`[IndexNow] Response status: ${status}`);

    // IndexNow returns 200/202 on success
    if (status === 200 || status === 202) {
      console.log('[IndexNow] URLs submitted successfully');
      return new Response(
        JSON.stringify({ 
          success: true, 
          submitted: validUrls.length,
          urls: validUrls 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle errors
    const errorText = await response.text();
    console.error('[IndexNow] Error response:', errorText);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        status,
        error: errorText 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[IndexNow] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
