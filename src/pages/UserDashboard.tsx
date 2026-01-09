import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Crown, Users, TrendingUp, Star, DollarSign, Share2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useHasTipsterProfile, useIsTipsterActive } from '@/hooks/useTipsterProfile';
import { MLMStatsCard } from '@/features/mlm/components/MLMStatsCard';
import { MLMReferralCodeCard } from '@/features/mlm/components/MLMReferralCodeCard';
import { Layout } from '@/components/Layout';

export default function UserDashboard() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const hasTipsterProfile = useHasTipsterProfile();
  const isTipsterActive = useIsTipsterActive();

  const tipsterBenefits = [
    { icon: DollarSign, label: t('dashboard.tipster.benefits.revenue') },
    { icon: Users, label: t('dashboard.tipster.benefits.subscribers') },
    { icon: Star, label: t('dashboard.tipster.benefits.visibility') },
    { icon: TrendingUp, label: t('dashboard.tipster.benefits.analytics') },
  ];

  const mlmBenefits = [
    { icon: Share2, label: t('dashboard.mlm.benefits.referral') },
    { icon: DollarSign, label: t('dashboard.mlm.benefits.commission') },
    { icon: TrendingUp, label: t('dashboard.mlm.benefits.network') },
  ];

  return (
    <Layout hideNavigation>
      <div className="min-h-screen bg-background pt-safe">
        {/* Header */}
        <div className="sticky top-[env(safe-area-inset-top,0px)] z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-3 px-4 py-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/profile')}
              className="shrink-0 -ml-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">
              {t('dashboard.title')}
            </h1>
          </div>
        </div>

      <div className="pb-24">
        {/* Tipster Premium Section */}
        <div className="px-4 py-5">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
              <Crown className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold">
                {t('dashboard.tipster.title')}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {t('dashboard.tipster.description')}
              </p>
            </div>
          </div>

          {hasTipsterProfile ? (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <div className={`h-2 w-2 rounded-full ${isTipsterActive ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                <span className={isTipsterActive ? 'text-green-600' : 'text-muted-foreground'}>
                  {isTipsterActive 
                    ? t('dashboard.tipster.statusActive')
                    : t('dashboard.tipster.statusInactive')
                  }
                </span>
              </div>
              <Button 
                variant="ghost"
                onClick={() => navigate('/tipster/dashboard')}
                className="w-full justify-between h-12 px-4 bg-muted/50"
              >
                <span>{t('dashboard.tipster.goToDashboard')}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="flex flex-wrap gap-2">
                {tipsterBenefits.map((benefit, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 text-sm"
                  >
                    <benefit.icon className="h-3.5 w-3.5 text-primary" />
                    <span className="text-muted-foreground">{benefit.label}</span>
                  </div>
                ))}
              </div>
              <Button 
                onClick={() => navigate('/tipster/setup')}
                className="w-full h-12"
              >
                <Crown className="h-4 w-4 mr-2" />
                {t('dashboard.tipster.becomeTipster')}
              </Button>
            </div>
          )}
        </div>

        <Separator />

        {/* MLM Section */}
        <div className="px-4 py-5">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-blue-500/10 shrink-0">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold">
                {t('dashboard.mlm.title')}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {t('dashboard.mlm.description')}
              </p>
            </div>
          </div>

          {/* MLM Benefits preview */}
          <div className="flex flex-wrap gap-2 mt-4">
            {mlmBenefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 text-sm"
              >
                <benefit.icon className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-muted-foreground">{benefit.label}</span>
              </div>
            ))}
          </div>

          {/* MLM Stats - inline style */}
          <div className="mt-5">
            <MLMStatsCard />
          </div>
          
          {/* Referral Code */}
          <div className="mt-4">
            <MLMReferralCodeCard />
          </div>
        </div>
      </div>
      </div>
    </Layout>
  );
}
