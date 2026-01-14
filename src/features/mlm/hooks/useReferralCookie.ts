/**
 * Referral code cookie utilities
 * Cookies are shared between Safari and PWA on iOS (unlike localStorage)
 * This ensures referral codes survive PWA installation
 */

const COOKIE_NAME = 'pryzen_ref';
const EXPIRY_DAYS = 7;

export function saveReferralToCookie(code: string): void {
  if (!code) return;
  
  try {
    const expires = new Date();
    expires.setDate(expires.getDate() + EXPIRY_DAYS);
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(code.toUpperCase())}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  } catch (e) {
    console.warn('Failed to save referral code to cookie:', e);
  }
}

export function getReferralFromCookie(): string | null {
  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  } catch (e) {
    console.warn('Failed to read referral code from cookie:', e);
    return null;
  }
}

export function clearReferralCookie(): void {
  try {
    document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  } catch (e) {
    console.warn('Failed to clear referral cookie:', e);
  }
}
