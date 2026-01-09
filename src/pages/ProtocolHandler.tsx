import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { saveReferralCode } from '@/features/mlm/hooks/useReferralStorage';
import { Loader2 } from 'lucide-react';

/**
 * Protocol handler for web+pryzen:// links
 * Example: web+pryzen://r/ABC123 -> saves referral code and redirects
 */
export default function ProtocolHandler() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const protocolUrl = searchParams.get('url') || '';
    
    let targetPath = '/';
    
    try {
      // Parse web+pryzen:// URL
      // Format: web+pryzen://path or web+pryzen:path
      const cleanUrl = protocolUrl.replace(/^web\+pryzen:\/?\/?/, '');
      
      // Handle referral code format: r/CODE
      const referralMatch = cleanUrl.match(/^r\/([A-Za-z0-9]+)/);
      if (referralMatch) {
        saveReferralCode(referralMatch[1]);
        targetPath = '/auth';
      } else if (cleanUrl.startsWith('/')) {
        targetPath = cleanUrl;
      } else if (cleanUrl) {
        targetPath = '/' + cleanUrl;
      }
    } catch {
      // Fallback to home
      targetPath = '/';
    }
    
    navigate(targetPath, { replace: true });
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Ouverture...</p>
    </div>
  );
}
