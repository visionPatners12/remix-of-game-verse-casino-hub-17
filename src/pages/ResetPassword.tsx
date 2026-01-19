import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, KeyRound, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [hasSession, setHasSession] = useState<boolean>(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!isMounted) return;
        setHasSession(!!data.session);
      } catch (e) {
        setHasSession(false);
      } finally {
        if (isMounted) setIsChecking(false);
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const passwordError = useMemo(() => {
    if (!password) return '';
    if (password.length < 8) return 'At least 8 characters required.';
    return '';
  }, [password]);

  const confirmError = useMemo(() => {
    if (!confirmPassword) return '';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return '';
  }, [password, confirmPassword]);

  const canSubmit = !!password && !!confirmPassword && !passwordError && !confirmError && hasSession && !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(error.message || "Unable to update password");
        return;
      }
      setSuccess(true);
      toast.success('Password updated');
      setTimeout(() => navigate('/auth'), 2000);
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <section className="space-y-6">
        <header className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Reset Password</h1>
          <p className="text-muted-foreground text-sm">Choose a new password to secure your account.</p>
        </header>

        {isChecking ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !hasSession && !success ? (
          <article className="rounded-lg border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">Invalid or expired link. Request a new reset email.</p>
            <div className="mt-4 flex justify-center">
              <Button variant="outline" onClick={() => navigate('/auth')}>Back to Login</Button>
            </div>
          </article>
        ) : success ? (
          <article className="rounded-lg border bg-card p-6 text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-lg font-medium">Password Updated</h2>
            <p className="text-sm text-muted-foreground">Redirecting to login page...</p>
            <div className="pt-2">
              <Button onClick={() => navigate('/auth')}>Go to Login</Button>
            </div>
          </article>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                aria-invalid={!!passwordError}
              />
              {passwordError && (
                <p className="text-sm text-destructive">{passwordError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                aria-invalid={!!confirmError}
              />
              {confirmError && (
                <p className="text-sm text-destructive">{confirmError}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={!canSubmit}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>Update Password</>
              )}
            </Button>

            <div className="text-center">
              <Button type="button" variant="ghost" onClick={() => navigate('/auth')}>
                Back to Login
              </Button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}

export default ResetPassword;
