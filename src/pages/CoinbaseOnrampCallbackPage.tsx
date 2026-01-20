import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, XCircle, Wallet, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type CallbackStatus = 'success' | 'pending' | 'failed' | 'unknown';

const CoinbaseOnrampCallbackPage: React.FC = () => {
  const { t } = useTranslation('deposit');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<CallbackStatus>('unknown');

  // Parse Coinbase callback params
  const sessionId = searchParams.get('sessionId');
  const transactionId = searchParams.get('transactionId');
  const statusParam = searchParams.get('status');

  useEffect(() => {
    // Determine status from params
    if (statusParam === 'success' || transactionId) {
      setStatus('success');
    } else if (statusParam === 'pending') {
      setStatus('pending');
    } else if (statusParam === 'failed' || statusParam === 'error') {
      setStatus('failed');
    } else {
      // Default to pending if we have a sessionId but no clear status
      setStatus(sessionId ? 'pending' : 'unknown');
    }

    // Clean up localStorage pending state
    localStorage.removeItem('coinbase_deposit_pending_v1');
  }, [statusParam, transactionId, sessionId]);

  const handleViewWallet = () => {
    navigate('/wallet');
  };

  const handleRetry = () => {
    navigate('/deposit/coinbase');
  };

  const handleNewDeposit = () => {
    navigate('/deposit', { state: { from: '/wallet' } });
  };

  const renderContent = () => {
    switch (status) {
      case 'success':
        return (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="flex flex-col items-center text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center"
            >
              <CheckCircle className="w-12 h-12 text-green-500" />
            </motion.div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                {t('callback.onramp.success.title', 'Deposit Successful!')}
              </h1>
              <p className="text-muted-foreground">
                {t('callback.onramp.success.description', 'Your USDC has been added to your wallet.')}
              </p>
            </div>

            {transactionId && (
              <div className="bg-muted/50 rounded-lg px-4 py-2">
                <p className="text-xs text-muted-foreground">
                  {t('callback.transactionId', 'Transaction ID')}
                </p>
                <p className="text-sm font-mono text-foreground truncate max-w-[200px]">
                  {transactionId}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 w-full max-w-xs">
              <Button onClick={handleViewWallet} className="w-full">
                <Wallet className="w-4 h-4 mr-2" />
                {t('callback.viewWallet', 'View My Wallet')}
              </Button>
              <Button variant="outline" onClick={handleNewDeposit} className="w-full">
                {t('callback.newDeposit', 'New Deposit')}
              </Button>
            </div>
          </motion.div>
        );

      case 'pending':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center space-y-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center"
            >
              <Clock className="w-12 h-12 text-yellow-500" />
            </motion.div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                {t('callback.onramp.pending.title', 'Processing Your Deposit')}
              </h1>
              <p className="text-muted-foreground">
                {t('callback.onramp.pending.description', 'Your transaction is being processed. This may take a few minutes.')}
              </p>
            </div>

            {sessionId && (
              <div className="bg-muted/50 rounded-lg px-4 py-2">
                <p className="text-xs text-muted-foreground">
                  {t('callback.sessionId', 'Session ID')}
                </p>
                <p className="text-sm font-mono text-foreground truncate max-w-[200px]">
                  {sessionId}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 w-full max-w-xs">
              <Button onClick={handleViewWallet} className="w-full">
                <Wallet className="w-4 h-4 mr-2" />
                {t('callback.viewWallet', 'View My Wallet')}
              </Button>
            </div>
          </motion.div>
        );

      case 'failed':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center"
            >
              <XCircle className="w-12 h-12 text-destructive" />
            </motion.div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                {t('callback.onramp.failed.title', 'Deposit Failed')}
              </h1>
              <p className="text-muted-foreground">
                {t('callback.onramp.failed.description', 'Something went wrong with your deposit. Please try again.')}
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-xs">
              <Button onClick={handleRetry} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                {t('callback.retry', 'Try Again')}
              </Button>
              <Button variant="outline" onClick={handleViewWallet} className="w-full">
                {t('callback.viewWallet', 'View My Wallet')}
              </Button>
            </div>
          </motion.div>
        );

      default:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center space-y-6"
          >
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <Wallet className="w-12 h-12 text-muted-foreground" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                {t('callback.onramp.unknown.title', 'Deposit Status Unknown')}
              </h1>
              <p className="text-muted-foreground">
                {t('callback.onramp.unknown.description', 'Check your wallet to see if your deposit was successful.')}
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-xs">
              <Button onClick={handleViewWallet} className="w-full">
                <Wallet className="w-4 h-4 mr-2" />
                {t('callback.viewWallet', 'View My Wallet')}
              </Button>
              <Button variant="outline" onClick={handleNewDeposit} className="w-full">
                {t('callback.newDeposit', 'New Deposit')}
              </Button>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {renderContent()}
      </div>
    </div>
  );
};

export default CoinbaseOnrampCallbackPage;
