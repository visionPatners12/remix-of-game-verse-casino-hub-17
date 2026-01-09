import { useState, useEffect } from 'react';

interface LeagueLogo {
  id: string;
  url: string;
  name: string;
}

// Default logos for common leagues
const DEFAULT_LOGOS: Record<string, string> = {
  'premier-league': '/images/leagues/premier-league.png',
  'champions-league': '/images/leagues/champions-league.png',
  'la-liga': '/images/leagues/la-liga.png',
  'bundesliga': '/images/leagues/bundesliga.png',
  'serie-a': '/images/leagues/serie-a.png',
  'ligue-1': '/images/leagues/ligue-1.png',
};

export function useLeagueLogos() {
  const [logos, setLogos] = useState<Record<string, string>>(DEFAULT_LOGOS);
  const [isLoading, setIsLoading] = useState(false);

  const getLeagueLogo = (leagueId: string, fallbackUrl?: string): string => {
    return logos[leagueId] || fallbackUrl || '/images/leagues/default-league.png';
  };

  const loadLeagueLogo = async (leagueId: string, logoUrl: string) => {
    if (logos[leagueId] === logoUrl) return;
    
    setIsLoading(true);
    try {
      // Test if logo URL is accessible
      const img = new Image();
      img.onload = () => {
        setLogos(prev => ({ ...prev, [leagueId]: logoUrl }));
        setIsLoading(false);
      };
      img.onerror = () => {
        setIsLoading(false);
      };
      img.src = logoUrl;
    } catch (error) {
      setIsLoading(false);
    }
  };

  return {
    logos,
    getLeagueLogo,
    loadLeagueLogo,
    isLoading
  };
}