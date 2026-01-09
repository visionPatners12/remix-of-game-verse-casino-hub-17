import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BASE_URL = 'https://pryzen.io';

export const HreflangTags = () => {
  const location = useLocation();
  
  useEffect(() => {
    const currentPath = location.pathname + location.search;
    const canonicalUrl = `${BASE_URL}${currentPath}`;
    
    // Remove existing hreflang tags
    document.querySelectorAll('link[hreflang]').forEach(el => el.remove());
    
    // Create hreflang tags for EN/FR
    const hreflangEn = document.createElement('link');
    hreflangEn.rel = 'alternate';
    hreflangEn.hreflang = 'en';
    hreflangEn.href = canonicalUrl;
    
    const hreflangFr = document.createElement('link');
    hreflangFr.rel = 'alternate';
    hreflangFr.hreflang = 'fr';
    hreflangFr.href = canonicalUrl;
    
    const hreflangDefault = document.createElement('link');
    hreflangDefault.rel = 'alternate';
    hreflangDefault.hreflang = 'x-default';
    hreflangDefault.href = canonicalUrl;
    
    document.head.appendChild(hreflangEn);
    document.head.appendChild(hreflangFr);
    document.head.appendChild(hreflangDefault);
    
    return () => {
      hreflangEn.remove();
      hreflangFr.remove();
      hreflangDefault.remove();
    };
  }, [location.pathname, location.search]);
  
  return null;
};
