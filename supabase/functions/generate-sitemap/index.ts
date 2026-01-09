import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BASE_URL = 'https://pryzen.io';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date().toISOString();
    let urls: string[] = [];

    // Static pages
    const staticPages = [
      { loc: '/', priority: '1.0', changefreq: 'daily' },
      { loc: '/sports', priority: '0.9', changefreq: 'hourly' },
      { loc: '/polymarket', priority: '0.8', changefreq: 'hourly' },
      { loc: '/dashboard', priority: '0.7', changefreq: 'daily' },
      { loc: '/leaderboard', priority: '0.6', changefreq: 'daily' },
      { loc: '/faq', priority: '0.5', changefreq: 'monthly' },
      { loc: '/about', priority: '0.5', changefreq: 'monthly' },
      { loc: '/support', priority: '0.5', changefreq: 'monthly' },
      { loc: '/responsible-gaming', priority: '0.4', changefreq: 'monthly' },
      { loc: '/terms', priority: '0.3', changefreq: 'monthly' },
      { loc: '/privacy', priority: '0.3', changefreq: 'monthly' },
    ];

    for (const page of staticPages) {
      urls.push(`
    <url>
      <loc>${BASE_URL}${page.loc}</loc>
      <lastmod>${now}</lastmod>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
    </url>`);
    }

    // Fetch active Polymarket events
    const { data: polymarketEvents } = await supabase
      .from('polymarket_events')
      .select('id, slug, updated_at, end_date')
      .eq('active', true)
      .order('volume_24h', { ascending: false })
      .limit(500);

    if (polymarketEvents) {
      for (const event of polymarketEvents) {
        const endDate = event.end_date ? new Date(event.end_date) : null;
        const priority = endDate && endDate > new Date() ? '0.7' : '0.5';
        urls.push(`
    <url>
      <loc>${BASE_URL}/polymarket/event/${event.slug}/${event.id}</loc>
      <lastmod>${event.updated_at || now}</lastmod>
      <changefreq>hourly</changefreq>
      <priority>${priority}</priority>
    </url>`);
      }
    }

    // Fetch top leagues
    const { data: leagues } = await supabase
      .from('top_entities')
      .select('slug, updated_at')
      .eq('entity_type', 'league')
      .limit(200);

    if (leagues) {
      for (const league of leagues) {
        urls.push(`
    <url>
      <loc>${BASE_URL}/league/${league.slug}</loc>
      <lastmod>${league.updated_at || now}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.7</priority>
    </url>`);
      }
    }

    // Fetch top teams
    const { data: teams } = await supabase
      .from('top_entities')
      .select('slug, updated_at')
      .eq('entity_type', 'team')
      .limit(300);

    if (teams) {
      for (const team of teams) {
        urls.push(`
    <url>
      <loc>${BASE_URL}/team/${team.slug}</loc>
      <lastmod>${team.updated_at || now}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.6</priority>
    </url>`);
      }
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    // Fallback sitemap
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${BASE_URL}/</loc><priority>1.0</priority></url>
  <url><loc>${BASE_URL}/sports</loc><priority>0.9</priority></url>
  <url><loc>${BASE_URL}/polymarket</loc><priority>0.8</priority></url>
</urlset>`;
    return new Response(fallback, {
      headers: { ...corsHeaders, 'Content-Type': 'application/xml' },
    });
  }
});
