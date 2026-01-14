import { useEffect } from 'react';

const BASE_URL = 'https://pryzen.app';

const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Pryzen Game",
  "alternateName": ["Pryzen", "Pryzen Games", "Pryzen Crypto Games"],
  "url": BASE_URL,
  "description": "Crypto multiplayer games and on-chain betting platform. Play Ludo with friends, compete for crypto rewards.",
  "inLanguage": ["en"],
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${BASE_URL}/search?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  }
};

const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Pryzen Game",
  "url": BASE_URL,
  "logo": {
    "@type": "ImageObject",
    "url": `${BASE_URL}/pryzen-logo.png`,
    "width": 512,
    "height": 512
  },
  "sameAs": [
    "https://twitter.com/pryzen",
    "https://discord.gg/pryzen",
    "https://t.me/pryzen"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "url": `${BASE_URL}/support`
  }
};

const GAME_APPLICATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  "name": "Pryzen Game",
  "description": "Crypto multiplayer games with on-chain betting. Play Ludo, compete with friends, win USDC rewards.",
  "url": BASE_URL,
  "genre": ["Multiplayer", "Board Game", "Crypto Gaming"],
  "gamePlatform": ["Web Browser", "iOS", "Android"],
  "applicationCategory": "GameApplication",
  "operatingSystem": "Any",
  "playMode": ["MultiPlayer", "CoOp"],
  "numberOfPlayers": {
    "@type": "QuantitativeValue",
    "minValue": 2,
    "maxValue": 4
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "author": {
    "@type": "Organization",
    "name": "Pryzen Game"
  }
};

export const GlobalSEOSchema = () => {
  useEffect(() => {
    const schemas = [
      { id: 'global-website-schema', data: WEBSITE_SCHEMA },
      { id: 'global-organization-schema', data: ORGANIZATION_SCHEMA },
      { id: 'global-game-schema', data: GAME_APPLICATION_SCHEMA }
    ];

    schemas.forEach(({ id, data }) => {
      // Remove existing if present
      const existing = document.getElementById(id);
      if (existing) existing.remove();

      // Create and inject schema
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = id;
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
    });

    return () => {
      schemas.forEach(({ id }) => {
        const script = document.getElementById(id);
        if (script) script.remove();
      });
    };
  }, []);

  return null;
};
