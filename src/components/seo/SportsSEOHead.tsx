import React from 'react';

// Base URL for canonical and OG URLs
const BASE_URL = 'https://pryzen.io';

interface SportsSEOHeadProps {
  pageType: 'sports' | 'league' | 'team' | 'match' | 'player';
  data?: {
    // Sports page (list)
    selectedSport?: string;
    
    // League data
    league?: {
      id: string;
      name: string;
      slug: string;
      logo?: string;
      country?: string;
      sport?: string;
    };
    
    // Team data
    team?: {
      id: string;
      name: string;
      slug: string;
      logo_url?: string;
      country?: string;
      league?: string;
      sport?: string;
    };
    
    // Match data
    match?: {
      id: string;
      home_team?: { name: string; logo?: string };
      away_team?: { name: string; logo?: string };
      league?: { name: string; slug?: string };
      start_iso?: string;
      sport?: string;
    };
    
    // Player data
    player?: {
      id: string;
      name: string;
      logo?: string;
      position?: string;
      team?: string;
      sport?: string;
    };
  };
  canonical?: string;
}

// Helper to truncate text for meta description
const truncateText = (text: string, maxLength: number = 160): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

// Generate meta content based on page type
const generateMeta = (pageType: string, data: SportsSEOHeadProps['data']) => {
  switch (pageType) {
    case 'sports': {
      const sport = data?.selectedSport || 'Sports';
      const sportCapitalized = sport.charAt(0).toUpperCase() + sport.slice(1);
      return {
        title: `${sportCapitalized} Betting - Live Odds & Markets | PRYZEN`,
        description: `Bet on ${sportCapitalized.toLowerCase()} matches with live odds. View upcoming games, live scores, and betting markets on PRYZEN.`,
        keywords: `${sportCapitalized.toLowerCase()} betting, live odds, sports betting, ${sportCapitalized.toLowerCase()} odds, betting markets`,
        image: `${BASE_URL}/og-sports.png`,
        url: `${BASE_URL}/sports`,
      };
    }
    
    case 'league': {
      const league = data?.league;
      if (!league) return null;
      return {
        title: `${league.name} - ${league.sport || 'Sports'} | PRYZEN`,
        description: truncateText(`Follow ${league.name} - standings, fixtures, results and betting odds. Get the latest ${league.name} news and live scores.`),
        keywords: `${league.name}, ${league.sport || 'sports'} standings, fixtures, betting odds, live scores`,
        image: league.logo || `${BASE_URL}/og-sports.png`,
        url: `${BASE_URL}/league/${league.country?.toLowerCase().replace(/\s+/g, '-') || 'unknown'}/${league.slug}/${league.id}`,
      };
    }
    
    case 'team': {
      const team = data?.team;
      if (!team) return null;
      return {
        title: `${team.name} - ${team.league || team.sport || 'Sports'} | PRYZEN`,
        description: truncateText(`${team.name} stats, fixtures, results and betting odds. Follow ${team.name} matches and get live scores.`),
        keywords: `${team.name}, ${team.sport || 'sports'} team, fixtures, stats, betting odds`,
        image: team.logo_url || `${BASE_URL}/og-sports.png`,
        url: `${BASE_URL}/team/${team.sport?.toLowerCase().replace(/\s+/g, '-') || 'unknown'}/${team.slug}/${team.id}`,
      };
    }
    
    case 'match': {
      const match = data?.match;
      if (!match?.home_team || !match?.away_team) return null;
      const matchTitle = `${match.home_team.name} vs ${match.away_team.name}`;
      const date = match.start_iso ? new Date(match.start_iso).toLocaleDateString('en-US', { 
        weekday: 'short', month: 'short', day: 'numeric' 
      }) : '';
      return {
        title: `${matchTitle} - ${match.league?.name || 'Match'} | PRYZEN`,
        description: truncateText(`Live odds for ${matchTitle}. ${date}${match.league?.name ? ` - ${match.league.name}` : ''}. Bet on this match with competitive odds.`),
        keywords: `${match.home_team.name}, ${match.away_team.name}, betting odds, live match, ${match.league?.name || 'sports'}`,
        image: match.home_team.logo || match.away_team.logo || `${BASE_URL}/og-sports.png`,
        url: `${BASE_URL}/match/${match.sport?.toLowerCase().replace(/\s+/g, '-') || 'unknown'}/${match.league?.slug || 'unknown'}/${match.home_team.name?.toLowerCase().replace(/\s+/g, '-')}-vs-${match.away_team.name?.toLowerCase().replace(/\s+/g, '-')}/${match.id}`,
      };
    }
    
    case 'player': {
      const player = data?.player;
      if (!player) return null;
      return {
        title: `${player.name} - ${player.position || 'Player'} | PRYZEN`,
        description: truncateText(`${player.name} stats, career history and market value.${player.team ? ` Currently plays for ${player.team}.` : ''}`),
        keywords: `${player.name}, ${player.sport || 'sports'} player, stats, career, ${player.team || ''}`,
        image: player.logo || `${BASE_URL}/og-sports.png`,
        url: `${BASE_URL}/player/${player.id}`,
      };
    }
    
    default:
      return null;
  }
};

// Generate JSON-LD Schema based on page type
const generateSchema = (pageType: string, data: SportsSEOHeadProps['data']) => {
  const schemas: object[] = [];
  
  // Base organization schema
  const organizationSchema = {
    "@type": "Organization",
    "name": "PRYZEN",
    "url": BASE_URL,
    "logo": `${BASE_URL}/logo.png`
  };

  switch (pageType) {
    case 'sports': {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": `${data?.selectedSport?.charAt(0).toUpperCase()}${data?.selectedSport?.slice(1) || 'Sports'} Betting - Live Odds`,
        "description": "Explore sports betting markets with live odds and upcoming matches",
        "url": `${BASE_URL}/sports`,
        "publisher": organizationSchema
      });
      break;
    }
    
    case 'league': {
      const league = data?.league;
      if (league) {
        schemas.push({
          "@context": "https://schema.org",
          "@type": "SportsOrganization",
          "name": league.name,
          "url": `${BASE_URL}/league/${league.slug}`,
          "logo": league.logo,
          "sport": league.sport || "Football",
          ...(league.country && { "location": { "@type": "Country", "name": league.country } })
        });
        
        // Breadcrumb
        schemas.push({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
            { "@type": "ListItem", "position": 2, "name": "Sports", "item": `${BASE_URL}/sports` },
            { "@type": "ListItem", "position": 3, "name": league.name }
          ]
        });
      }
      break;
    }
    
    case 'team': {
      const team = data?.team;
      if (team) {
        schemas.push({
          "@context": "https://schema.org",
          "@type": "SportsTeam",
          "name": team.name,
          "url": `${BASE_URL}/team/${team.slug}`,
          "logo": team.logo_url,
          "sport": team.sport || "Football",
          ...(team.league && { 
            "memberOf": { 
              "@type": "SportsOrganization", 
              "name": team.league 
            } 
          })
        });
        
        // Breadcrumb
        schemas.push({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
            { "@type": "ListItem", "position": 2, "name": "Sports", "item": `${BASE_URL}/sports` },
            { "@type": "ListItem", "position": 3, "name": team.name }
          ]
        });
      }
      break;
    }
    
    case 'match': {
      const match = data?.match;
      if (match?.home_team && match?.away_team) {
        schemas.push({
          "@context": "https://schema.org",
          "@type": "SportsEvent",
          "name": `${match.home_team.name} vs ${match.away_team.name}`,
          "url": `${BASE_URL}/match-details/${match.id}`,
          ...(match.start_iso && { "startDate": match.start_iso }),
          "homeTeam": { 
            "@type": "SportsTeam", 
            "name": match.home_team.name,
            ...(match.home_team.logo && { "logo": match.home_team.logo })
          },
          "awayTeam": { 
            "@type": "SportsTeam", 
            "name": match.away_team.name,
            ...(match.away_team.logo && { "logo": match.away_team.logo })
          },
          ...(match.league && { 
            "superEvent": { 
              "@type": "SportsOrganization", 
              "name": match.league.name 
            } 
          }),
          "organizer": organizationSchema
        });
        
        // Breadcrumb
        schemas.push({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
            { "@type": "ListItem", "position": 2, "name": "Sports", "item": `${BASE_URL}/sports` },
            ...(match.league?.slug ? [{ "@type": "ListItem", "position": 3, "name": match.league.name, "item": `${BASE_URL}/league/${match.league.slug}` }] : []),
            { "@type": "ListItem", "position": match.league?.slug ? 4 : 3, "name": `${match.home_team.name} vs ${match.away_team.name}` }
          ]
        });
      }
      break;
    }
    
    case 'player': {
      const player = data?.player;
      if (player) {
        schemas.push({
          "@context": "https://schema.org",
          "@type": "Person",
          "name": player.name,
          "url": `${BASE_URL}/player/${player.id}`,
          ...(player.logo && { "image": player.logo }),
          ...(player.position && { "jobTitle": player.position }),
          ...(player.team && { 
            "memberOf": { 
              "@type": "SportsTeam", 
              "name": player.team 
            } 
          })
        });
        
        // Breadcrumb
        schemas.push({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
            { "@type": "ListItem", "position": 2, "name": "Sports", "item": `${BASE_URL}/sports` },
            { "@type": "ListItem", "position": 3, "name": player.name }
          ]
        });
      }
      break;
    }
  }
  
  return schemas;
};

export function SportsSEOHead({ pageType, data, canonical }: SportsSEOHeadProps) {
  const meta = generateMeta(pageType, data);
  const schemas = generateSchema(pageType, data);
  
  if (!meta) return null;
  
  const canonicalUrl = canonical || meta.url;

  React.useEffect(() => {
    // Update document title
    document.title = meta.title;

    // Helper to update or create meta tag
    const setMetaTag = (property: string, content: string, isName = false) => {
      const attr = isName ? 'name' : 'property';
      let element = document.querySelector(`meta[${attr}="${property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Basic meta tags
    setMetaTag('description', meta.description, true);
    setMetaTag('keywords', meta.keywords, true);

    // Open Graph tags
    setMetaTag('og:type', pageType === 'sports' ? 'website' : 'article');
    setMetaTag('og:title', meta.title);
    setMetaTag('og:description', meta.description);
    setMetaTag('og:image', meta.image);
    setMetaTag('og:url', canonicalUrl);
    setMetaTag('og:site_name', 'PRYZEN');

    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image', true);
    setMetaTag('twitter:title', meta.title, true);
    setMetaTag('twitter:description', meta.description, true);
    setMetaTag('twitter:image', meta.image, true);
    setMetaTag('twitter:site', '@PRYZEN', true);

    // Canonical URL
    let canonicalElement = document.querySelector('link[rel="canonical"]');
    if (!canonicalElement) {
      canonicalElement = document.createElement('link');
      canonicalElement.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalElement);
    }
    canonicalElement.setAttribute('href', canonicalUrl);

    // JSON-LD Schema
    const existingSchemas = document.querySelectorAll('script[data-seo="sports"]');
    existingSchemas.forEach(el => el.remove());
    
    schemas.forEach((schema, index) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo', 'sports');
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    // Cleanup function
    return () => {
      const schemasToRemove = document.querySelectorAll('script[data-seo="sports"]');
      schemasToRemove.forEach(el => el.remove());
    };
  }, [meta, schemas, canonicalUrl, pageType]);

  return null;
}

export default SportsSEOHead;
