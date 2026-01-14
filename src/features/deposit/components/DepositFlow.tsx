import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Smartphone, Building2, ChevronRight, Check, Copy, Clock, AlertCircle, Info, Wallet } from 'lucide-react';
import { useDeposit } from '../hooks/useDeposit';
import { useUnifiedWallet } from '@/features/wallet';
import { useFundWallet } from '@privy-io/react-auth';
import { base } from 'viem/chains';
import { cn } from '@/lib/utils';
import QRCode from 'react-qr-code';
import { toast } from 'sonner';
import coinbaseLogo from '@/assets/coinbase-logo.png';
import { TokenUSDC, NetworkBase, NetworkPolygon, NetworkEthereum, NetworkArbitrumOne, NetworkOptimism } from '@web3icons/react';

type DepositMethod = 'crypto' | 'coinbase' | 'mobile-money' | 'bank-transfer' | 'apple-pay';

interface DepositMethodOption {
  id: DepositMethod;
  titleKey: string;
  descriptionKey: string;
  iconType: 'usdc' | 'coinbase' | 'smartphone' | 'bank';
  available: boolean;
  recommended?: boolean;
}

const DepositFlow = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('deposit');
  const { selectedCrypto, isLoadingAddress, ensSubdomain } = useDeposit();
  const { address } = useUnifiedWallet();
  const [copiedENS, setCopiedENS] = useState(false);
  const { fundWallet } = useFundWallet();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState<DepositMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const depositMethods: DepositMethodOption[] = [
    {
      id: 'crypto',
      titleKey: 'methods.crypto.title',
      descriptionKey: 'methods.crypto.description',
      iconType: 'usdc',
      available: true,
      recommended: true
    },
    {
      id: 'coinbase',
      titleKey: 'methods.coinbase.buyTitle',
      descriptionKey: 'methods.coinbase.description',
      iconType: 'coinbase',
      available: true
    },
    {
      id: 'mobile-money',
      titleKey: 'methods.mobileMoney.title',
      descriptionKey: 'methods.mobileMoney.description',
      iconType: 'smartphone',
      available: false
    },
    {
      id: 'bank-transfer',
      titleKey: 'methods.bankTransfer.title',
      descriptionKey: 'methods.bankTransfer.description',
      iconType: 'bank',
      available: false
    }
  ];

  const renderMethodIcon = (iconType: DepositMethodOption['iconType'], available: boolean) => {
    const iconClass = cn("h-5 w-5", available ? "text-primary" : "text-muted-foreground");
    
    switch (iconType) {
      case 'usdc':
        // USDC with Base network badge overlay (like MetaMask style)
        return (
          <div className="relative">
            <TokenUSDC variant="branded" size={28} />
            <div className="absolute -bottom-0.5 -right-0.5 bg-background rounded-full p-0.5">
              <NetworkBase variant="branded" size={12} />
            </div>
          </div>
        );
      case 'coinbase':
        return <img src={coinbaseLogo} alt="Coinbase" className="h-7 w-7" />;
      case 'smartphone':
        return <Smartphone className={iconClass} />;
      case 'bank':
        return <Building2 className={iconClass} />;
    }
  };

  const handleApplePayFund = async () => {
    if (!address) return;
    setIsProcessing(true);
    try {
      await fundWallet(address, { chain: base, amount: '0.01' });
      setCurrentStep(3);
    } catch (error) {
      console.error('Apple Pay funding failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMethodSelect = (method: DepositMethod) => {
    if (method === 'coinbase') {
      navigate('/deposit/coinbase');
      return;
    }
    if (method === 'apple-pay') {
      handleApplePayFund();
      return;
    }
    setSelectedMethod(method);
    setCurrentStep(2);
  };

  const handleBack = () => {
    if (currentStep === 1) {
      navigate(-1);
    } else {
      setCurrentStep(1);
      setSelectedMethod(null);
    }
  };

  const handleCopyAddress = async () => {
    if (!selectedCrypto.address) return;
    try {
      await navigator.clipboard.writeText(selectedCrypto.address);
      setCopied(true);
      toast.success(t('crypto.addressCopied'));
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleCopyENS = async () => {
    if (!ensSubdomain) return;
    try {
      await navigator.clipboard.writeText(ensSubdomain);
      setCopiedENS(true);
      toast.success(t('crypto.ensCopied'));
      setTimeout(() => setCopiedENS(false), 2000);
    } catch (error) {
      console.error('Failed to copy ENS:', error);
    }
  };

  // Native-style header
  const renderHeader = () => (
    <div 
      className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center h-14 px-4">
        <button 
          onClick={handleBack}
          className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full active:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-center font-semibold text-lg pr-8">
          {currentStep === 1 ? t('page.title') : t('page.title')}
        </h1>
      </div>
    </div>
  );

  // Step 1: Method selection
  const renderMethodSelection = () => (
    <div className="px-4 py-6 space-y-2">
      {depositMethods.map((method) => {
        return (
          <button
            key={method.id}
            onClick={() => method.available && handleMethodSelect(method.id)}
            disabled={!method.available || isProcessing}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-xl transition-all",
              "active:scale-[0.98] active:bg-muted/80",
              method.available 
                ? "bg-card hover:bg-muted/50" 
                : "bg-muted/30 opacity-60"
            )}
          >
            <div className={cn(
              "w-11 h-11 rounded-full flex items-center justify-center overflow-hidden",
              method.available ? "bg-primary/10" : "bg-muted"
            )}>
              {renderMethodIcon(method.iconType, method.available)}
            </div>
            
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <span className="font-medium">{t(method.titleKey)}</span>
                {method.recommended && (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary text-primary-foreground rounded">
                    {t('methods.recommended')}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{t(method.descriptionKey)}</p>
            </div>
            
            {method.available ? (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            ) : (
              <span className="text-xs text-muted-foreground">{t('methods.comingSoon')}</span>
            )}
          </button>
        );
      })}
    </div>
  );

  // Step 2: Crypto deposit details
  const renderCryptoDetails = () => {
    if (isLoadingAddress) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-muted-foreground text-sm">{t('crypto.loading')}</p>
        </div>
      );
    }

    if (!selectedCrypto.address) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">{t('crypto.error')}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            {t('crypto.retry')}
          </Button>
        </div>
      );
    }

    return (
      <div className="px-4 py-6 space-y-6">
        {/* ENS Address Card (Primary) */}
        {ensSubdomain && (
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-5 border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">{t('crypto.ensTitle')}</p>
                <p className="text-xl font-bold text-primary truncate">{ensSubdomain}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('crypto.ensDescription')}</p>
              </div>
              <button
                onClick={handleCopyENS}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ml-3 transition-all",
                  copiedENS ? "bg-green-500/20" : "bg-primary/10 active:bg-primary/20"
                )}
              >
                {copiedENS ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5 text-primary" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* QR Code section */}
        <div className="flex flex-col items-center">
          <div className="bg-card p-4 rounded-2xl shadow-sm border border-border/30">
            <QRCode
              value={selectedCrypto.address}
              size={180}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox="0 0 256 256"
              level="M"
            />
          </div>
          <p className="mt-3 text-sm text-muted-foreground text-center">
            {t('crypto.qrDescription')}
          </p>
        </div>

        {/* Wallet Address Card */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <label className="text-sm font-medium text-muted-foreground">
              {t('crypto.walletTitle')}
            </label>
          </div>
          <button
            onClick={handleCopyAddress}
            className={cn(
              "w-full flex items-center gap-3 p-4 rounded-xl transition-all",
              "bg-muted/50 active:bg-muted active:scale-[0.99]"
            )}
          >
            <code className="flex-1 text-sm font-mono text-left break-all">
              {selectedCrypto.address}
            </code>
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
              copied ? "bg-green-500/10" : "bg-primary/10"
            )}>
              {copied ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5 text-primary" />
              )}
            </div>
          </button>
        </div>

        {/* Supported Chains */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground block">
            {t('crypto.supportedChains')}
          </label>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/50">
              <NetworkBase variant="branded" size={18} />
              <span className="text-sm font-medium">Base</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/50">
              <NetworkPolygon variant="branded" size={18} />
              <span className="text-sm font-medium">Polygon</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/50">
              <NetworkEthereum variant="branded" size={18} />
              <span className="text-sm font-medium">Ethereum</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/50">
              <NetworkArbitrumOne variant="branded" size={18} />
              <span className="text-sm font-medium">Arbitrum</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/50">
              <NetworkOptimism variant="branded" size={18} />
              <span className="text-sm font-medium">Optimism</span>
            </div>
          </div>
        </div>

        {/* Info Card - USDC on Base for games */}
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                {t('crypto.importantNote')}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300">
                {t('crypto.gameNote')}
              </p>
            </div>
          </div>
        </div>

        {/* Processing Time */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{t('processing.estimatedTime')}</p>
            <p className="text-xs text-muted-foreground">{t('processing.time')}</p>
          </div>
        </div>

        {/* Action button */}
        <Button 
          onClick={() => setCurrentStep(3)} 
          className="w-full h-12 text-base font-medium"
        >
          {t('buttons.continue')}
        </Button>
      </div>
    );
  };

  // Step 3: Confirmation
  const renderConfirmation = () => (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
        <Check className="h-10 w-10 text-green-500" />
      </div>
      
      <h2 className="text-xl font-semibold text-center mb-2">
        {selectedMethod === 'apple-pay' 
          ? t('confirmation.applePayTitle')
          : t('confirmation.cryptoTitle')}
      </h2>
      
      <p className="text-muted-foreground text-center text-sm mb-8 max-w-xs">
        {selectedMethod === 'apple-pay' 
          ? t('confirmation.applePayDesc')
          : t('confirmation.cryptoDesc')}
      </p>
      
      <div className="w-full space-y-3 max-w-xs">
        <Button 
          onClick={() => navigate('/wallet')} 
          className="w-full h-12 text-base font-medium"
        >
          {t('confirmation.viewWallet')}
        </Button>
        <Button 
          variant="outline" 
          onClick={() => {
            setCurrentStep(1);
            setSelectedMethod(null);
          }} 
          className="w-full h-12 text-base"
        >
          {t('confirmation.newDeposit')}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {renderHeader()}
      
      <div className="flex-1 flex flex-col">
        {currentStep === 1 && renderMethodSelection()}
        {currentStep === 2 && selectedMethod === 'crypto' && renderCryptoDetails()}
        {currentStep === 3 && renderConfirmation()}
      </div>
    </div>
  );
};

export default DepositFlow;
