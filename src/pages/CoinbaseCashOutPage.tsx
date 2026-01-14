import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, ExternalLink, Loader2 } from 'lucide-react';
import { TokenUSDC } from '@web3icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { MobilePageHeader } from '@/components/shared/MobilePageHeader';

const CoinbaseCashOutPage: React.FC = () => {
  const { t } = useTranslation('withdraw');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleCashOut = async () => {
    setIsLoading(true);
    // TODO: Implement edge function call to get session token
    // For now, just show coming soon
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MobilePageHeader 
        title={t('cashout.title', 'Cash Out to USD')} 
        onBack={() => navigate('/withdrawal')}
      />

      <div className="flex-1 px-4 py-6 space-y-6">
        {/* Visual Flow: USDC → USD */}
        <div className="flex items-center justify-center gap-4 py-8">
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-[#2775CA]/10 flex items-center justify-center">
              <TokenUSDC variant="branded" className="w-10 h-10" />
            </div>
            <span className="text-sm font-medium">USDC</span>
          </div>
          
          <ArrowRight className="h-6 w-6 text-muted-foreground" />
          
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-green-500">$</span>
            </div>
            <span className="text-sm font-medium">USD</span>
          </div>
        </div>

        {/* Description Card */}
        <Card className="border-border/50">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold">{t('cashout.subtitle', 'Convert your crypto to cash')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('cashout.description', 'Sell your USDC and receive USD directly in your bank account or Coinbase balance.')}
            </p>
          </CardContent>
        </Card>

        {/* Powered by Coinbase */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>{t('cashout.poweredBy', 'Powered by Coinbase')}</span>
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 3.6c4.64 0 8.4 3.76 8.4 8.4s-3.76 8.4-8.4 8.4-8.4-3.76-8.4-8.4 3.76-8.4 8.4-8.4zm-2.4 4.8v7.2h4.8c1.988 0 3.6-1.612 3.6-3.6s-1.612-3.6-3.6-3.6H9.6z"/>
          </svg>
        </div>

        {/* Cash Out Button */}
        <Button
          onClick={handleCashOut}
          disabled={isLoading}
          className="w-full h-14 text-base font-semibold gap-2"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {t('cashout.processing', 'Preparing...')}
            </>
          ) : (
            <>
              {t('cashout.comingSoon', 'Coming Soon')}
            </>
          )}
        </Button>

        {/* Note */}
        <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
          <ExternalLink className="h-3 w-3" />
          {t('cashout.note', "You'll be redirected to Coinbase to complete the transaction.")}
        </p>

        {/* Security Note */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              {t('cashout.securityNote', "Your transaction is secured by Coinbase's institutional-grade security.")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoinbaseCashOutPage;
