/**
 * Referral code storage utilities
 * Persists referral codes in localStorage with 7-day expiration
 */

const STORAGE_KEY = 'pryzen_referral_code';
const EXPIRY_KEY = 'pryzen_referral_code_expiry';
const EXPIRY_DAYS = 7;

export function saveReferralCode(code: string): void {
  if (!code) return;
  
  const expiryTime = Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  
  try {
    localStorage.setItem(STORAGE_KEY, code.toUpperCase());
    localStorage.setItem(EXPIRY_KEY, expiryTime.toString());
  } catch (e) {
    console.warn('Failed to save referral code to localStorage:', e);
  }
}

export function getReferralCode(): string | null {
  try {
    const code = localStorage.getItem(STORAGE_KEY);
    const expiry = localStorage.getItem(EXPIRY_KEY);
    
    if (!code || !expiry) return null;
    
    // Check if expired
    if (Date.now() > parseInt(expiry, 10)) {
      clearReferralCode();
      return null;
    }
    
    return code;
  } catch (e) {
    console.warn('Failed to read referral code from localStorage:', e);
    return null;
  }
}

export function clearReferralCode(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(EXPIRY_KEY);
  } catch (e) {
    console.warn('Failed to clear referral code from localStorage:', e);
  }
}
