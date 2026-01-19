import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useAuth } from "@/features/auth";
import {
  MLMReferralCodeCard,
  MLMNetworkCard,
  LudoReferralPeriodSelector,
  LudoReferralStatsHero,
  LudoReferralLevelBreakdown,
} from "@/features/mlm";

const Refer = () => {
  const { t } = useTranslation('referral');
  const { session } = useAuth();
  const [periodDays, setPeriodDays] = useState(30);

  return (
    <Layout>
      <div className="px-4 py-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">{t('page.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('page.subtitle')}
          </p>
        </div>

        {session ? (
          <>
            {/* Period Selector */}
            <LudoReferralPeriodSelector
              selectedPeriod={periodDays}
              onPeriodChange={setPeriodDays}
            />

            {/* Stats Hero */}
            <LudoReferralStatsHero periodDays={periodDays} />

            {/* Referral Code */}
            <MLMReferralCodeCard />

            {/* Level Breakdown */}
            <LudoReferralLevelBreakdown periodDays={periodDays} />

            {/* Network Tree */}
            <MLMNetworkCard />
          </>
        ) : (
          /* Login Required */
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('page.loginRequired')}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('page.loginRequired')}
                </p>
                <Button asChild>
                  <a href="/auth">{t('common:login', 'Sign In')}</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* How it Works */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{t('howItWorks.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary font-bold text-xs">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">{t('howItWorks.step1.title')}</h4>
                  <p className="text-xs text-muted-foreground">
                    {t('howItWorks.step1.description')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary font-bold text-xs">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">{t('howItWorks.step2.title')}</h4>
                  <p className="text-xs text-muted-foreground">
                    {t('howItWorks.step2.description')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary font-bold text-xs">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">{t('howItWorks.step3.title')}</h4>
                  <p className="text-xs text-muted-foreground">
                    {t('howItWorks.step3.description')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commission Rates */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{t('rates.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-blue-500/5 rounded-lg border-l-2 border-blue-500">
                <span className="text-sm font-medium">{t('levels.n1')} ({t('levels.directReferrals')})</span>
                <span className="text-sm font-bold text-blue-600">1.5%</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-purple-500/5 rounded-lg border-l-2 border-purple-500">
                <span className="text-sm font-medium">{t('levels.n2')} ({t('levels.indirectReferrals')})</span>
                <span className="text-sm font-bold text-purple-600">0.5%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{t('terms.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {t('terms.description')}
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Refer;
