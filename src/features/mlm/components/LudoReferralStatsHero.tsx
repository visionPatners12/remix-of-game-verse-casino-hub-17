import { Users, TrendingUp, DollarSign, Clock, Gamepad2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLudoReferralStats } from '@/features/ludo/hooks/useLudoReferralStats';

interface LudoReferralStatsHeroProps {
  periodDays: number;
}

export function LudoReferralStatsHero({ periodDays }: LudoReferralStatsHeroProps) {
  const { t } = useTranslation('common');
  const { data: stats, isLoading } = useLudoReferralStats(periodDays);

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <Skeleton className="h-4 w-32 mx-auto mb-2" />
            <Skeleton className="h-10 w-40 mx-auto" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalStaked = (stats?.total_staked_n1 || 0) + (stats?.total_staked_n2 || 0);
  const totalEarnings = (stats?.total_earnings_n1 || 0) + (stats?.total_earnings_n2 || 0);
  const totalReferrals = (stats?.total_n1_referrals || 0) + (stats?.total_n2_referrals || 0);
  const totalGames = (stats?.total_games_n1 || 0) + (stats?.total_games_n2 || 0);

  const statItems = [
    {
      icon: Users,
      label: t('stats.referrals', { defaultValue: 'Filleuls' }),
      value: totalReferrals,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Gamepad2,
      label: t('stats.games', { defaultValue: 'Parties' }),
      value: totalGames,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: DollarSign,
      label: t('stats.earnings', { defaultValue: 'Gains' }),
      value: `$${totalEarnings.toFixed(2)}`,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: Clock,
      label: t('stats.pending', { defaultValue: 'En attente' }),
      value: `$${(stats?.pending_earnings || 0).toFixed(2)}`,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <CardContent className="pt-6">
        {/* Hero Stat */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-1">
            <TrendingUp className="h-4 w-4" />
            <span>{t('stats.totalStaked', { defaultValue: 'Total Misé par Réseau' })}</span>
          </div>
          <p className="text-3xl font-bold text-primary">
            ${totalStaked.toFixed(2)}
          </p>
          {periodDays > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {t('stats.lastDays', { days: periodDays, defaultValue: `Derniers ${periodDays} jours` })}
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2">
          {statItems.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-1.5 py-2"
            >
              <div className={`p-2 rounded-full ${item.bgColor}`}>
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <p className="text-[10px] text-muted-foreground text-center leading-tight">
                {item.label}
              </p>
              <p className="text-sm font-semibold">{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
