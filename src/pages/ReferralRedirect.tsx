import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { saveReferralCode } from '@/features/mlm/hooks/useReferralStorage';
import { Loader2 } from 'lucide-react';

/**
 * Short URL for sharing: /r/:code
 * Persists code (storage + cookie) and lands in the app with ?ref= for auth/landing to read.
 */
export default function ReferralRedirect() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (code) {
      // Save code to localStorage + cookie (survives PWA installation on iOS)
      saveReferralCode(code);
    }
    // Land in app; ?ref= keeps the code visible for onboarding while storage also holds it
    const q = code ? `?ref=${encodeURIComponent(code)}` : '';
    navigate(`/${q}`, { replace: true });
  }, [code, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Redirection...</p>
    </div>
  );
}
