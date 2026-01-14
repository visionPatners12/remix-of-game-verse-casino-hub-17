/**
 * Referral code storage utilities
 * Persists referral codes in localStorage AND cookies with 7-day expiration
 * 
 * Cookies are shared between Safari and PWA on iOS (unlike localStorage)
 * This ensures referral codes survive PWA installation
 */

import { 
  saveReferralToCookie, 
  getReferralFromCookie, 
  clearReferralCookie 
} from './useReferralCookie';

const STORAGE_KEY = 'pryzen_referral_code';
const EXPIRY_KEY = 'pryzen_referral_code_expiry';
const EXPIRY_DAYS = 7;

export function saveReferralCode(code: string): void {
  if (!code) return;
  
  const normalizedCode = code.toUpperCase();
  const expiryTime = Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  
  try {
    // Save to localStorage (primary)
    localStorage.setItem(STORAGE_KEY, normalizedCode);
    localStorage.setItem(EXPIRY_KEY, expiryTime.toString());
    
    // Also save to cookie (survives PWA installation on iOS)
    saveReferralToCookie(normalizedCode);
  } catch (e) {
    console.warn('Failed to save referral code:', e);
  }
}

export function getReferralCode(): string | null {
  try {
    // Try localStorage first
    const code = localStorage.getItem(STORAGE_KEY);
    const expiry = localStorage.getItem(EXPIRY_KEY);
    
    if (code && expiry) {
      // Check if expired
      if (Date.now() > parseInt(expiry, 10)) {
        clearReferralCode();
      } else {
        return code;
      }
    }
    
    // Fallback to cookie (useful after PWA installation on iOS)
    const cookieCode = getReferralFromCookie();
    if (cookieCode) {
      // Re-save to localStorage for future accesses
      saveReferralCode(cookieCode);
      return cookieCode;
    }
    
    return null;
  } catch (e) {
    console.warn('Failed to read referral code:', e);
    return null;
  }
}

export function clearReferralCode(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    clearReferralCookie();
  } catch (e) {
    console.warn('Failed to clear referral code:', e);
  }
}
