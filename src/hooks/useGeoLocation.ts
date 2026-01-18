import { useQuery } from '@tanstack/react-query';

interface GeoLocationData {
  ip: string;
  country_code: string;  // ISO 2-letter code (FR, US, etc.)
  country_name: string;
  city: string;
  region: string;
}

/**
 * Hook to detect user's location via IP geolocation
 * Uses ipapi.co - 1000 free requests/day, no API key required
 */
export function useGeoLocation() {
  return useQuery({
    queryKey: ['geo-location'],
    queryFn: async (): Promise<GeoLocationData | null> => {
      try {
        const response = await fetch('https://ipapi.co/json/', {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('[useGeoLocation] Detected country:', data.country_code);
          return data;
        }
      } catch (error) {
        console.warn('[useGeoLocation] Failed to detect location:', error);
      }
      return null;
    },
    staleTime: 1000 * 60 * 60 * 24, // Cache 24h
    gcTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });
}
