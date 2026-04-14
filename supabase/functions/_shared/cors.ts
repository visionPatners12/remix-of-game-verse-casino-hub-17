/**
 * Shared CORS for Edge Functions (browser preflight + supabase-js invoke).
 * Keep Allow-Headers broad enough for Authorization + apikey + client hints.
 */
export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, accept, accept-language, prefer, x-supabase-api-version',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};