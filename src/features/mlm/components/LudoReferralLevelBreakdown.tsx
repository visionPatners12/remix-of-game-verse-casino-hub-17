import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLudoReferralStats } from '@/features/ludo/hooks/useLudoReferralStats';
import { LUDO_REFERRAL_RATES, formatCommissionRate } from '@/config/ludoReferral';

interface LudoReferralLevelBreakdownProps {
  periodDays: number;
}

export function LudoReferralLevelBreakdown({ periodDays }: LudoReferralLevelBreakdownProps) {
  const { t } = useTranslation('common');
  const { data: stats, isLoading } = useLudoReferralStats(periodDays);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  const levels = [
    {
      level: 1,
      name: 'N1',
      rate: formatCommissionRate(1),
      referrals: stats?.total_n1_referrals || 0,
      games: stats?.total_games_n1 || 0,
      staked: stats?.total_staked_n1 || 0,
      earnings: stats?.total_earnings_n1 || 0,
      color: 'border-l-blue-500',
      bgColor: 'bg-blue-500/5',
    },
    {
      level: 2,
      name: 'N2',
      rate: formatCommissionRate(2),
      referrals: stats?.total_n2_referrals || 0,
      games: stats?.total_games_n2 || 0,
      staked: stats?.total_staked_n2 || 0,
      earnings: stats?.total_earnings_n2 || 0,
      color: 'border-l-purple-500',
      bgColor: 'bg-purple-500/5',
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {t('referral.levelBreakdown', { defaultValue: 'Détail par Niveau' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {levels.map((level) => (
          <div
            key={level.level}
            className={`p-3 rounded-lg border-l-4 ${level.color} ${level.bgColor}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{level.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({level.rate})
                </span>
              </div>
              <span className="text-sm font-semibold text-green-600">
                +${level.earnings.toFixed(2)}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
              <div>
                <span className="block font-medium text-foreground">
                  {level.referrals}
                </span>
                <span>{t('stats.referrals', { defaultValue: 'Filleuls' })}</span>
              </div>
              <div>
                <span className="block font-medium text-foreground">
                  {level.games}
                </span>
                <span>{t('stats.games', { defaultValue: 'Parties' })}</span>
              </div>
              <div>
                <span className="block font-medium text-foreground">
                  ${level.staked.toFixed(2)}
                </span>
                <span>{t('stats.staked', { defaultValue: 'Misé' })}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
