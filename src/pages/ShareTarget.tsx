import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { saveReferralCode } from '@/features/mlm/hooks/useReferralStorage';
import { Loader2 } from 'lucide-react';

/**
 * PWA Share Target handler
 * Receives shared URLs and routes them appropriately
 * 
 * Supports:
 * - Referral links: /r/:code or ?ref=:code
 * - Direct URLs: any pryzen.app URL
 */
export default function ShareTarget() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const sharedUrl = searchParams.get('url') || searchParams.get('text') || '';
    
    // Try to parse the shared URL
    let targetPath = '/';
    
    try {
      const url = new URL(sharedUrl);
      
      // Check if it's a pryzen URL
      if (url.hostname.includes('pryzen') || url.hostname.includes('localhost')) {
        targetPath = url.pathname + url.search;
        
        // Handle Ludo game room links: /games/ludo/play/:gameId
        const ludoMatch = url.pathname.match(/^\/games\/ludo\/play\/([a-zA-Z0-9-]+)$/);
        if (ludoMatch) {
          targetPath = `/games/ludo/play/${ludoMatch[1]}`;
        }
        
        // Handle referral codes
        const refCode = url.searchParams.get('ref');
        if (refCode) {
          saveReferralCode(refCode);
        }
        
        // Handle /r/:code format
        const referralMatch = url.pathname.match(/^\/r\/([A-Za-z0-9]+)$/);
        if (referralMatch) {
          saveReferralCode(referralMatch[1]);
          targetPath = '/auth';
        }
      }
    } catch {
      // If not a valid URL, check for Ludo game link pattern
      const ludoMatch = sharedUrl.match(/\/games\/ludo\/play\/([a-zA-Z0-9-]+)/);
      if (ludoMatch) {
        targetPath = `/games/ludo/play/${ludoMatch[1]}`;
      } else {
        // Check if it contains a referral code pattern
        const codeMatch = sharedUrl.match(/\/r\/([A-Za-z0-9]+)/);
        if (codeMatch) {
          saveReferralCode(codeMatch[1]);
          targetPath = '/auth';
        }
      }
    }
    
    // Navigate to the target
    navigate(targetPath, { replace: true });
    
    // Fallback: if still on this page after 2s, force hard navigation
    const timeout = setTimeout(() => {
      if (window.location.pathname === '/share-target') {
        window.location.href = targetPath;
      }
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Ouverture du lien...</p>
    </div>
  );
}
