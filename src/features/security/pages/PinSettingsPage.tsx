import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PinSetup } from '../components/PinSetup';
import { PinVerification } from '../components/PinVerification';
import { usePinManagement } from '../hooks/usePinManagement';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Switch, Separator } from '@/ui';
import { ArrowLeft, Shield, Trash2, Edit, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'overview' | 'create' | 'change' | 'verify-delete' | 'verify-change';

export const PinSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('security');
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  
  // Detect source page via URL parameter
  const searchParams = new URLSearchParams(location.search);
  const fromPage = searchParams.get('from');
  const { 
    pinStatus, 
    createPin, 
    updatePin, 
    verifyPin, 
    togglePin, 
    deletePin,
    isCreating,
    isToggling,
    isDeleting
  } = usePinManagement();

  const handleCreatePin = async (pin: string) => {
    await createPin(pin);
    if (fromPage === 'withdraw') {
      navigate('/withdrawal');
    } else {
      setViewMode('overview');
    }
  };

  const handleUpdatePin = async (pin: string) => {
    await updatePin(pin, '');
    if (fromPage === 'withdraw') {
      navigate('/withdrawal');
    } else {
      setViewMode('overview');
    }
  };

  const handleVerifyForDelete = async (pin: string): Promise<boolean> => {
    const isValid = await verifyPin(pin);
    if (isValid) {
      await deletePin();
      setViewMode('overview');
    }
    return isValid;
  };

  const handleVerifyForChange = async (pin: string): Promise<boolean> => {
    const isValid = await verifyPin(pin);
    if (isValid) {
      setViewMode('change');
    }
    return isValid;
  };

  const handleTogglePin = async (enabled: boolean) => {
    if (!enabled && pinStatus?.hasPin) {
      setViewMode('verify-change');
      return;
    }
    await togglePin(enabled);
  };

  const formatLastUsed = (lastUsedAt: string | null) => {
    if (!lastUsedAt) return t('pin.neverUsed');
    const date = new Date(lastUsedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return t('pin.today');
    if (diffDays === 1) return t('pin.yesterday');
    if (diffDays < 7) return t('pin.daysAgo', { count: diffDays });
    return date.toLocaleDateString();
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* PIN Status Card */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('pin.securityPinCode')}
          </CardTitle>
          <CardDescription>
            {t('pin.securityPinDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pinStatus?.hasPin ? (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{t('pin.status')}</p>
                  <p className="text-sm text-muted-foreground">
                    {pinStatus.isEnabled ? (
                      <span className="text-success">✓ {t('pin.enabled')}</span>
                    ) : (
                      <span className="text-warning">{t('pin.disabled')}</span>
                    )}
                  </p>
                </div>
                <Switch
                  checked={pinStatus.isEnabled}
                  onCheckedChange={handleTogglePin}
                  disabled={isToggling}
                />
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">{t('pin.lastUsed')}</p>
                  <p className="text-muted-foreground">
                    {formatLastUsed(pinStatus.lastUsedAt)}
                  </p>
                </div>
                <div>
                  <p className="font-medium">{t('pin.failedAttempts')}</p>
                  <p className={cn(
                    "text-muted-foreground",
                    pinStatus.failedAttempts > 0 && "text-warning"
                  )}>
                    {pinStatus.failedAttempts}/3
                  </p>
                </div>
              </div>

              {pinStatus.isLocked && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{t('pin.accountLocked')}</span>
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setViewMode('verify-change')}
                  disabled={pinStatus.isLocked}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {t('pin.modify')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setViewMode('verify-delete')}
                  disabled={pinStatus.isLocked || isDeleting}
                  className="flex-1 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('pin.delete')}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">{t('pin.noPinConfigured')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('pin.createPinDescription')}
              </p>
              <Button onClick={() => setViewMode('create')}>
                {t('pin.createPin')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Info */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t('pin.securitySessions')}
          </CardTitle>
          <CardDescription>
            {t('pin.howSecurityWorks')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 bg-primary rounded-full mt-2" />
            <div>
              <p className="font-medium">{t('pin.payments')}</p>
              <p className="text-muted-foreground">{t('pin.paymentsDescription')}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 bg-primary rounded-full mt-2" />
            <div>
              <p className="font-medium">{t('pin.sensitiveSettings')}</p>
              <p className="text-muted-foreground">{t('pin.sensitiveSettingsDescription')}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 bg-primary rounded-full mt-2" />
            <div>
              <p className="font-medium">{t('pin.security')}</p>
              <p className="text-muted-foreground">{t('pin.securityDescription')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderView = () => {
    switch (viewMode) {
      case 'create':
        return (
          <PinSetup
            mode="create"
            onComplete={handleCreatePin}
            onCancel={() => setViewMode('overview')}
            isLoading={isCreating}
          />
        );
      case 'change':
        return (
          <PinSetup
            mode="change"
            onComplete={handleUpdatePin}
            onCancel={() => setViewMode('overview')}
            isLoading={isCreating}
          />
        );
      case 'verify-delete':
        return (
          <PinVerification
            title={t('pin.deletePinTitle')}
            description={t('pin.deletePinDescription')}
            onVerify={handleVerifyForDelete}
            onCancel={() => setViewMode('overview')}
          />
        );
      case 'verify-change':
        return (
          <PinVerification
            title={t('pin.verificationRequired')}
            description={t('pin.enterCurrentPinToContinue')}
            onVerify={handleVerifyForChange}
            onCancel={() => setViewMode('overview')}
          />
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto p-4 space-y-6 pb-safe">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/settings', { replace: true })}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('pin.back')}
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t('pin.title')}</h1>
            <p className="text-muted-foreground">
              {t('pin.subtitle')}
            </p>
          </div>
        </div>

        {renderView()}
      </div>
    </div>
  );
};
