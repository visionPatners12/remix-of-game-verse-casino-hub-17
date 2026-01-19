import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { saveReferralCode } from '@/features/mlm/hooks/useReferralStorage';
import { Loader2 } from 'lucide-react';

/**
 * Short URL redirect page for referral links
 * Route: /r/:code
 * 
 * Saves the referral code to localStorage and redirects to /auth
 */
export default function ReferralRedirect() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (code) {
      // Save code to localStorage + cookie (survives PWA installation on iOS)
      saveReferralCode(code);
    }
    // Always redirect to home - code is persisted via cookie for later signup
    navigate('/', { replace: true });
  }, [code, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Redirection...</p>
    </div>
  );
}
