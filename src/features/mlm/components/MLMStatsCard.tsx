import { Users, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMLMStats } from '../hooks';
import { Skeleton } from '@/components/ui/skeleton';

export function MLMStatsCard() {
  const { t } = useTranslation('common');
  const { data: stats, isLoading } = useMLMStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-4 w-8" />
          </div>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      icon: Users,
      label: t('stats.referrals'),
      value: stats?.total_referrals || 0,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: TrendingUp,
      label: t('stats.networkMargin'),
      value: `$${(stats?.total_margin || 0).toFixed(0)}`,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: DollarSign,
      label: t('stats.totalEarnings'),
      value: `$${(stats?.total_earnings || 0).toFixed(0)}`,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      icon: Clock,
      label: t('stats.pending'),
      value: `$${(stats?.pending_earnings || 0).toFixed(0)}`,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {statItems.map((item, index) => (
        <div
          key={index}
          className="flex flex-col items-center gap-1.5 py-3"
        >
          <div className={`p-2.5 rounded-full ${item.bgColor}`}>
            <item.icon className={`h-4 w-4 ${item.color}`} />
          </div>
          <p className="text-[10px] text-muted-foreground text-center leading-tight">
            {item.label}
          </p>
          <p className="text-sm font-semibold">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
