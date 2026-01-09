import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://swgfutwpszlqdyrpwkhg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3Z2Z1dHdwc3pscWR5cnB3a2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzOTY0OTIsImV4cCI6MjA3MTk3MjQ5Mn0.GkT7YwcyE8nlE47kA-2sZgPYGK3nBgRtdE2DJZsMeJo";

/**
 * Client Supabase dédié au schéma sports_data
 * Utilise ce client pour toutes les requêtes liées aux données sportives
 */
export const sportsDataClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  db: { schema: 'sports_data' },
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
