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
      // Save code to localStorage for later processing after signup
      saveReferralCode(code);
      
      // Redirect to auth page
      navigate('/auth', { replace: true });
    } else {
      // No code provided, redirect to home
      navigate('/', { replace: true });
    }
  }, [code, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Redirection...</p>
    </div>
  );
}
