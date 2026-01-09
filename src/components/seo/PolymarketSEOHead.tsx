import { useEffect } from 'react';

interface PolymarketEvent {
  id: string | number;
  title: string;
  description?: string;
  icon?: string;
  image?: string;
  endDate?: string;
  startDate?: string;
  volume?: number;
  markets?: Array<{
    id: string;
    question: string;
  }>;
  tags?: string[];
}

interface PolymarketSEOHeadProps {
  // For list page
  category?: string | null;
  subcategory?: string | null;
  tab?: string;
  // For detail page
  event?: PolymarketEvent;
  // Common
  canonical?: string;
}

const BASE_URL = 'https://pryzen.io';
const DEFAULT_IMAGE = `${BASE_URL}/pryzen-logo.png`;
const SITE_NAME = 'PRYZEN';

// Category-specific SEO meta data
const CATEGORY_SEO: Record<string, { title: string; description: string; keywords: string }> = {
  politics: {
    title: 'Political Prediction Markets',
    description: 'Bet on elections, government policies, and political events. Get live odds on US elections, presidential races, Congress outcomes and global politics.',
    keywords: 'political betting, election odds, presidential predictions, congress betting, political markets, election forecasts, trump odds, biden predictions'
  },
  sports: {
    title: 'Sports Prediction Markets',
    description: 'Predict outcomes of NFL, NBA, UFC, Soccer and more. Live sports betting odds, championship predictions and player performance markets.',
    keywords: 'sports betting odds, nfl predictions, nba betting, ufc odds, soccer predictions, super bowl odds, championship betting, sports forecasts'
  },
  crypto: {
    title: 'Crypto Prediction Markets',
    description: 'Trade predictions on Bitcoin, Ethereum, altcoins and DeFi. Forecast crypto prices, ETF approvals, blockchain events and market trends.',
    keywords: 'crypto predictions, bitcoin price forecast, ethereum odds, btc etf, defi betting, altcoin predictions, crypto market forecasts'
  },
  tech: {
    title: 'Tech Prediction Markets',
    description: 'Predict tech industry outcomes - AI developments, product launches, company earnings and startup IPOs. Bet on the future of technology.',
    keywords: 'tech predictions, ai forecasts, apple predictions, google odds, startup ipo, tech earnings, silicon valley betting'
  },
  culture: {
    title: 'Culture & Entertainment Markets',
    description: 'Bet on entertainment events, award shows, celebrity news and pop culture. Predict Oscar winners, Grammy outcomes and viral trends.',
    keywords: 'entertainment betting, oscar predictions, grammy odds, celebrity predictions, pop culture betting, award show forecasts'
  },
  economy: {
    title: 'Economy Prediction Markets',
    description: 'Forecast economic indicators - interest rates, inflation, GDP, employment data. Trade predictions on Fed decisions and market trends.',
    keywords: 'economic predictions, fed rate odds, inflation forecast, gdp betting, recession predictions, employment forecasts, economic indicators'
  },
  geopolitics: {
    title: 'Geopolitics Prediction Markets',
    description: 'Predict global events - conflicts, treaties, international relations and world leaders. Bet on geopolitical outcomes and global affairs.',
    keywords: 'geopolitics betting, war predictions, international relations, global events, world politics odds, conflict forecasts'
  },
  world: {
    title: 'World Events Prediction Markets',
    description: 'Trade predictions on global news, natural events, climate and international happenings. Bet on world events and global outcomes.',
    keywords: 'world events betting, global predictions, climate forecasts, international news, world affairs odds'
  }
};

export const PolymarketSEOHead: React.FC<PolymarketSEOHeadProps> = ({
  category,
  subcategory,
  tab,
  event,
  canonical,
}) => {
  useEffect(() => {
    const isEventPage = !!event;
    
    // Generate dynamic meta content
    const { title, description, keywords, image, url } = isEventPage
      ? generateEventMeta(event!, canonical)
      : generateListMeta(category, subcategory, tab, canonical);

    // Update document title
    document.title = title;

    // Helper functions for meta management
    const upsertMeta = (property: string, content: string, isName = false) => {
      const attr = isName ? 'name' : 'property';
      let el = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, property);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    const upsertLink = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!el) {
        el = document.createElement('link');
        el.rel = rel;
        document.head.appendChild(el);
      }
      el.href = href;
    };

    // Basic meta tags
    upsertMeta('description', description, true);
    upsertMeta('keywords', keywords, true);
    upsertMeta('robots', 'index, follow', true);

    // Canonical URL
    upsertLink('canonical', url);

    // Open Graph tags
    upsertMeta('og:type', isEventPage ? 'article' : 'website');
    upsertMeta('og:title', title);
    upsertMeta('og:description', description);
    upsertMeta('og:image', image);
    upsertMeta('og:url', url);
    upsertMeta('og:site_name', SITE_NAME);
    upsertMeta('og:locale', 'en_US');

    // Twitter Card tags
    upsertMeta('twitter:card', 'summary_large_image', true);
    upsertMeta('twitter:title', title, true);
    upsertMeta('twitter:description', description, true);
    upsertMeta('twitter:image', image, true);
    upsertMeta('twitter:site', '@pryzen_app', true);

    // JSON-LD Structured Data
    const existingJsonLd = document.querySelector('script[data-seo="polymarket"]');
    if (existingJsonLd) {
      existingJsonLd.remove();
    }

    const jsonLdScript = document.createElement('script');
    jsonLdScript.type = 'application/ld+json';
    jsonLdScript.setAttribute('data-seo', 'polymarket');
    
    const structuredData = isEventPage
      ? generateEventSchema(event!, url, image)
      : generateListSchema(url);
    
    jsonLdScript.textContent = JSON.stringify(structuredData);
    document.head.appendChild(jsonLdScript);

    // Cleanup on unmount
    return () => {
      const script = document.querySelector('script[data-seo="polymarket"]');
      if (script) script.remove();
    };
  }, [event, category, subcategory, tab, canonical]);

  return null;
};

// Generate meta for list page
function generateListMeta(
  category: string | null | undefined,
  subcategory: string | null | undefined,
  tab: string | undefined,
  canonical: string | undefined
) {
  const categorySlug = category?.toLowerCase() || null;
  const categoryLabel = category ? formatLabel(category) : null;
  const subcategoryLabel = subcategory ? formatLabel(subcategory) : null;
  const tabLabel = tab ? formatLabel(tab) : 'Trending';

  let title = 'Polymarket';
  let description = 'Explore real-time prediction markets on politics, sports, crypto, entertainment and more. Get live odds and market insights on Polymarket.';
  let keywords = 'polymarket, prediction markets, betting odds, crypto predictions, political predictions, sports betting';

  // Use category-specific SEO if available
  if (categorySlug && CATEGORY_SEO[categorySlug]) {
    const categorySeo = CATEGORY_SEO[categorySlug];
    title = `${categorySeo.title} | Polymarket`;
    description = categorySeo.description;
    keywords = `${categorySeo.keywords}, polymarket, prediction markets`;
    
    if (subcategoryLabel) {
      title = `${subcategoryLabel} | ${categorySeo.title} | Polymarket`;
      description = `${subcategoryLabel} prediction markets - ${categorySeo.description}`;
      keywords = `${subcategoryLabel.toLowerCase()}, ${keywords}`;
    }
  } else if (categoryLabel) {
    // Fallback for unknown categories
    title = `${categoryLabel} | Polymarket`;
    description = `Explore ${categoryLabel.toLowerCase()} prediction markets on Polymarket. Get live odds, market trends and insights.`;
    keywords = `${categoryLabel.toLowerCase()} polymarket, ${categoryLabel.toLowerCase()} predictions, ${keywords}`;
    
    if (subcategoryLabel) {
      title = `${subcategoryLabel} | ${categoryLabel} | Polymarket`;
      description = `${subcategoryLabel} prediction markets in ${categoryLabel.toLowerCase()} on Polymarket. Live odds and market analysis.`;
      keywords = `${subcategoryLabel.toLowerCase()}, ${keywords}`;
    }
  } else if (tabLabel !== 'Trending') {
    title = `${tabLabel} | Polymarket`;
  }

  title = `${title} | ${SITE_NAME}`;
  
  const url = canonical || `${BASE_URL}/polymarket`;

  return { title, description, keywords, image: DEFAULT_IMAGE, url };
}

// Generate meta for event detail page
function generateEventMeta(
  event: PolymarketEvent,
  canonical: string | undefined
) {
  const title = `${truncate(event.title, 55)} | ${SITE_NAME}`;
  
  const description = event.description
    ? truncate(event.description, 155)
    : `Prediction market for "${truncate(event.title, 100)}". View live odds, market depth and trade predictions.`;
  
  const keywords = [
    ...(event.tags || []),
    'prediction market',
    'polymarket',
    'betting odds',
    event.title.split(' ').slice(0, 3).join(' ')
  ].join(', ');

  const image = event.icon || event.image || DEFAULT_IMAGE;
  const url = canonical || `${BASE_URL}/polymarket/event/${event.id}`;

  return { title, description, keywords, image, url };
}

// Generate JSON-LD for list page
function generateListSchema(url: string) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': url,
        'url': url,
        'name': 'Polymarket | PRYZEN',
        'description': 'Explore real-time prediction markets on politics, sports, crypto and more.',
        'isPartOf': {
          '@type': 'WebSite',
          'name': SITE_NAME,
          'url': BASE_URL
        }
      },
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': BASE_URL
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Polymarket',
            'item': `${BASE_URL}/polymarket`
          }
        ]
      }
    ]
  };
}

// Generate JSON-LD for event detail page
function generateEventSchema(
  event: PolymarketEvent,
  url: string,
  image: string
) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Event',
        '@id': url,
        'name': event.title,
        'description': event.description || `Prediction market: ${event.title}`,
        'image': image,
        'url': url,
        'eventStatus': 'https://schema.org/EventScheduled',
        'eventAttendanceMode': 'https://schema.org/OnlineEventAttendanceMode',
        ...(event.endDate && { 'endDate': event.endDate }),
        ...(event.startDate && { 'startDate': event.startDate }),
        'organizer': {
          '@type': 'Organization',
          'name': 'Polymarket',
          'url': 'https://polymarket.com'
        },
        'location': {
          '@type': 'VirtualLocation',
          'url': url
        }
      },
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': BASE_URL
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Polymarket',
            'item': `${BASE_URL}/polymarket`
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': truncate(event.title, 50),
            'item': url
          }
        ]
      }
    ]
  };

  // Add FAQPage schema if event has multiple markets
  if (event.markets && event.markets.length > 1) {
    schema['@graph'].push({
      '@type': 'FAQPage',
      'mainEntity': event.markets.slice(0, 10).map(market => ({
        '@type': 'Question',
        'name': market.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': `This is a prediction market question. View live odds and market data on PRYZEN.`
        }
      }))
    });
  }

  return schema;
}

// Utility functions
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3).trim() + '...';
}

function formatLabel(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default PolymarketSEOHead;
