import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface LudoReferralPeriodSelectorProps {
  selectedPeriod: number;
  onPeriodChange: (days: number) => void;
}

const PERIODS = [
  { days: 7, key: '7days' },
  { days: 30, key: '30days' },
  { days: 90, key: '90days' },
  { days: 0, key: 'allTime' },
];

export function LudoReferralPeriodSelector({
  selectedPeriod,
  onPeriodChange,
}: LudoReferralPeriodSelectorProps) {
  const { t } = useTranslation('referral');

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {PERIODS.map((period) => (
        <Button
          key={period.days}
          variant={selectedPeriod === period.days ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPeriodChange(period.days)}
          className="flex-shrink-0 text-xs h-8"
        >
          {t(`period.${period.key}`)}
        </Button>
      ))}
    </div>
  );
}
