import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLogin, usePrivy, useIdentityToken, useLogout } from '@privy-io/react-auth';
import { FloatingParticles } from '@/components/ui/FloatingParticles';
import { AnimatedGradientText } from '@/components/ui/AnimatedGradientText';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, Loader2, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { usePrivyModalFocusFix } from '@/hooks/usePrivyModalFocusFix';
import { toast } from 'sonner';

interface PrivyLoginScreenProps {
  logoUrl?: string;
}

type AuthView = 'main' | 'login' | 'signup';

export function PrivyLoginScreen({ logoUrl = "/pryzen-logo.png" }: PrivyLoginScreenProps) {
  const { t } = useTranslation('auth');
  
  // Fix for iOS PWA keyboard not appearing on Privy OTP input
  usePrivyModalFocusFix();
  
  // Auth view state
  const [authView, setAuthView] = useState<AuthView>('main');
  
  // Email/password form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Privy state
  const { ready } = usePrivy();
  const { identityToken } = useIdentityToken();
  const { logout } = useLogout();
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [, setCachedLoginMethod] = useLocalStorage<string | null>('privy_login_method', null);

  const { login } = useLogin({
    onComplete: async ({ loginMethod, loginAccount, user }) => {
      try {
        setIsConnecting(true);
        setWalletError(null);
        
        logger.auth('Login completed with method:', loginMethod);
        setCachedLoginMethod(loginMethod);
        logger.auth('🔵 Login completed, waiting for identity token...');
        
        let token = identityToken;
        let attempts = 0;
        const maxAttempts = 10;
        
        while (!token && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 500));
          attempts++;
          logger.auth(`⏳ Waiting for token... ${attempts}/${maxAttempts}`);
          token = identityToken;
        }
        
        if (!token) {
          throw new Error('Identity token not available after 5 seconds');
        }
        
        logger.auth('✅ Got identity token, calling privy-auth...');
        
        const { data: privyData, error: privyError } = await supabase.functions.invoke('privy-auth', {
          headers: {
            'privy-id-token': token
          },
          body: {
            privyIdToken: token,
            loginMethod,
            loginAccount: JSON.stringify(loginAccount),
            user: JSON.stringify(user)
          }
        });
        
        if (privyError) {
          throw new Error(`Privy auth failed: ${privyError.message}`);
        }
        
        if (!privyData?.success || !privyData?.session_url) {
          throw new Error('Invalid response from Privy auth');
        }
        
        logger.auth('Privy auth response:', {
          success: privyData?.success,
          session_url: privyData?.session_url,
          needs_onboarding: privyData?.user?.needs_onboarding
        });
        
        window.location.href = privyData.session_url;
      } catch (err) {
        logger.error('Authentication failed:', err);
        setWalletError(err instanceof Error ? err.message : 'Connection failed');
        setIsConnecting(false);
        try {
          await logout();
        } catch (logoutError) {
          logger.warn('Logout failed:', logoutError);
        }
      }
    },
    onError: (err) => {
      logger.error('[PrivyLoginScreen] Login error:', err);
      setWalletError(typeof err === 'string' ? err : 'Login failed');
      setIsConnecting(false);
    },
  });

  // Simplified wallet connect - let Privy handle deep linking natively
  const handleWalletConnect = () => {
    if (!ready || isConnecting) return;
    
    setIsConnecting(true);
    setWalletError(null);
    
    // Direct call to Privy login - it handles MetaMask deep links automatically
    login({
      loginMethods: ['email', 'wallet', 'sms'],
      walletChainType: 'ethereum-only',
    });
  };

  // Supabase email/password login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        if (error.message === 'Invalid login credentials') {
          toast.error('Incorrect email or password');
        } else {
          toast.error(error.message);
        }
        return;
      }
      
      toast.success('Welcome back!');
      // Navigation will be handled by Auth.tsx useEffect
    } catch (err) {
      logger.error('Login error:', err);
      toast.error('An error occurred during login');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Supabase email/password signup
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });
      
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('An account already exists with this email');
        } else {
          toast.error(error.message);
        }
        return;
      }
      
      toast.success('Check your email to confirm your account!');
    } catch (err) {
      logger.error('Signup error:', err);
      toast.error('An error occurred during signup');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Email/Password Form Component
  const EmailAuthForm = ({ isLogin }: { isLogin: boolean }) => (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onSubmit={isLogin ? handleEmailLogin : handleEmailSignup}
      className="w-full max-w-sm space-y-4"
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setAuthView('main')}
        className="mb-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 h-12 rounded-xl bg-background/50 border-border/50"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10 h-12 rounded-xl bg-background/50 border-border/50"
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        size="lg"
        className="w-full h-14 text-base font-semibold rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all shadow-lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {isLogin ? 'Signing in...' : 'Creating account...'}
          </>
        ) : (
          isLogin ? 'Sign In' : 'Create Account'
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button
          type="button"
          onClick={() => setAuthView(isLogin ? 'signup' : 'login')}
          className="text-primary hover:underline"
        >
          {isLogin ? 'Sign up' : 'Sign in'}
        </button>
      </p>
    </motion.form>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden safe-area-top">
      {/* Floating particles - reduced count for cleaner look */}
      <FloatingParticles count={20} />

      {/* Background effects - simplified */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Radial gradient */}
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent" />
        
        {/* Animated orbs - more subtle */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 -left-32 w-80 h-80 bg-primary/15 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative z-10 overflow-y-auto">
        {/* Logo with reveal animation - centered */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6"
        >
          <div className="relative">
            {/* Logo glow */}
            <motion.div 
              className="absolute inset-0 blur-3xl bg-primary/30 scale-150 rounded-full"
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            
            <img 
              src={logoUrl} 
              alt="PRYZEN" 
              className="h-24 object-contain relative z-10" 
            />
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-sm text-muted-foreground tracking-widest uppercase mb-6"
        >
          {t('onboarding.login.tagline', 'Bet. Win. Flex.')}
        </motion.p>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-2">
            {t('onboarding.login.title', 'Welcome to')}{' '}
            <AnimatedGradientText>{t('onboarding.login.titleHighlight', 'PRYZEN')}</AnimatedGradientText>
          </h1>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            {t('onboarding.login.subtitle', 'Sign in to continue')}
          </p>
        </motion.div>

        {/* Auth Content */}
        {authView === 'main' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="w-full max-w-sm space-y-4"
          >
            {/* Wallet Connect Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleWalletConnect}
                disabled={!ready || isConnecting}
                size="lg"
                className="w-full h-14 text-base font-semibold rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all shadow-lg"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t('onboarding.login.connecting', 'Connecting...')}
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-5 w-5" />
                    {t('onboarding.login.connectWallet', 'Connect Wallet')}
                  </>
                )}
              </Button>
            </motion.div>

            {walletError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-center text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20"
              >
                {walletError}
              </motion.div>
            )}

          </motion.div>
        ) : (
          <EmailAuthForm isLogin={authView === 'login'} />
        )}
      </div>

      {/* Footer with terms - simplified */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="px-6 pb-8 pb-safe text-center"
      >
        <p className="text-xs text-muted-foreground">
          {t('onboarding.login.termsPrefix', 'By continuing, you agree to our')}{" "}
          <a 
            href="#" 
            className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
          >
            {t('onboarding.login.terms', 'Terms')}
          </a>{" "}
          &{" "}
          <a 
            href="#" 
            className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
          >
            {t('onboarding.login.privacy', 'Privacy')}
          </a>
        </p>
      </motion.footer>
    </div>
  );
}
