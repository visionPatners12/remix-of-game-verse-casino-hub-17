import { useEffect } from 'react';

interface PageSEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  noIndex?: boolean;
  ogImage?: string;
  ogType?: string;
  jsonLd?: object;
}

const BASE_URL = 'https://pryzen.app';

const DEFAULT_SEO = {
  title: 'Pryzen Game - Crypto Multiplayer Games',
  description: 'Play multiplayer crypto games with friends. Bet on-chain, win crypto rewards.',
  keywords: 'crypto games, multiplayer, on-chain betting, blockchain games, ludo crypto',
  ogImage: `${BASE_URL}/pryzen-logo.png`
};

export const PageSEO = ({
  title,
  description,
  keywords,
  canonical,
  noIndex = false,
  ogImage = `${BASE_URL}/pryzen-logo.png`,
  ogType = 'website',
  jsonLd
}: PageSEOProps) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper to update or create meta tag
    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Basic meta tags
    setMeta('description', description);
    if (keywords) setMeta('keywords', keywords);
    
    // Robots
    setMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:type', ogType, true);
    setMeta('og:image', ogImage, true);
    if (canonical) setMeta('og:url', `${BASE_URL}${canonical}`, true);

    // Twitter
    setMeta('twitter:title', title, true);
    setMeta('twitter:description', description, true);
    setMeta('twitter:image', ogImage, true);

    // Canonical
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonical) {
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = `${BASE_URL}${canonical}`;
    }

    // JSON-LD
    if (jsonLd) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'page-seo-jsonld';
      script.textContent = JSON.stringify(jsonLd);
      
      const existing = document.getElementById('page-seo-jsonld');
      if (existing) existing.remove();
      
      document.head.appendChild(script);

      return () => {
        script.remove();
      };
    }
  }, [title, description, keywords, canonical, noIndex, ogImage, ogType, jsonLd]);

  return null;
};
