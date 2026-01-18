import { useUserProfile } from '@/features/profile/hooks/useUserProfile';
import { useGeoLocation } from './useGeoLocation';
import { useEffect } from 'react';

/**
 * Unified hook to get user's country with smart fallback:
 * 1. User profile (if saved)
 * 2. IP geolocation
 * 3. navigator.language
 * 4. Fallback 'US'
 * 
 * Auto-saves detected country to user profile if not set
 */
export function useUserCountry() {
  const { profile, updateProfile, isLoading: profileLoading } = useUserProfile();
  const { data: geoData, isLoading: geoLoading } = useGeoLocation();
  
  // Auto-update profile if country not set and we have geo data
  useEffect(() => {
    if (profile && !profile.country && geoData?.country_code) {
      console.log('[useUserCountry] Auto-saving country to profile:', geoData.country_code);
      updateProfile({ country: geoData.country_code });
    }
  }, [profile, geoData, updateProfile]);
  
  // Priority: profile > geo > navigator > fallback
  const getCountryFromNavigator = () => {
    const lang = navigator.language || 'en-US';
    const parts = lang.split('-');
    return parts.length > 1 ? parts[1].toUpperCase() : null;
  };
  
  const country = 
    profile?.country || 
    geoData?.country_code || 
    getCountryFromNavigator() || 
    'US';
  
  return {
    country,
    countryName: geoData?.country_name,
    isLoading: profileLoading || geoLoading,
    isFromProfile: !!profile?.country,
    isFromGeo: !profile?.country && !!geoData?.country_code,
  };
}
