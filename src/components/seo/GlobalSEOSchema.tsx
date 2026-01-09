import { useEffect } from 'react';

const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "PRYZEN",
  "alternateName": ["Pryzen", "PRYZEN Sports"],
  "url": "https://pryzen.io",
  "description": "The social network for sports fans. Follow matches, share predictions, and connect with fellow sports enthusiasts.",
  "inLanguage": ["en", "fr"],
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://pryzen.io/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
};

const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "PRYZEN",
  "url": "https://pryzen.io",
  "logo": {
    "@type": "ImageObject",
    "url": "https://pryzen.io/pryzen-logo.png",
    "width": 512,
    "height": 512
  },
  "sameAs": [
    "https://twitter.com/pryzen",
    "https://discord.gg/pryzen"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "url": "https://pryzen.io/support"
  }
};

export const GlobalSEOSchema = () => {
  useEffect(() => {
    // Create and inject Website schema
    const websiteScript = document.createElement('script');
    websiteScript.type = 'application/ld+json';
    websiteScript.id = 'global-website-schema';
    websiteScript.textContent = JSON.stringify(WEBSITE_SCHEMA);
    
    // Create and inject Organization schema
    const orgScript = document.createElement('script');
    orgScript.type = 'application/ld+json';
    orgScript.id = 'global-organization-schema';
    orgScript.textContent = JSON.stringify(ORGANIZATION_SCHEMA);
    
    // Remove existing if present, then add new
    const existingWebsite = document.getElementById('global-website-schema');
    const existingOrg = document.getElementById('global-organization-schema');
    
    if (existingWebsite) existingWebsite.remove();
    if (existingOrg) existingOrg.remove();
    
    document.head.appendChild(websiteScript);
    document.head.appendChild(orgScript);
    
    return () => {
      websiteScript.remove();
      orgScript.remove();
    };
  }, []);
  
  return null;
};
