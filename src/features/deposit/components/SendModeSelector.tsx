import React from 'react';
import { MapPin, User, Banknote, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export type SendMode = 'address' | 'user' | 'cashout';

interface SendModeSelectorProps {
  onSelectMode: (mode: SendMode) => void;
}

export const SendModeSelector: React.FC<SendModeSelectorProps> = ({ onSelectMode }) => {
  const { t } = useTranslation('withdraw');

  const modes = [
    {
      id: 'address' as SendMode,
      icon: MapPin,
      title: t('modes.address.title', 'To an Address'),
      description: t('modes.address.description', 'Enter wallet address manually')
    },
    {
      id: 'user' as SendMode,
      icon: User,
      title: t('modes.user.title', 'To a User'),
      description: t('modes.user.description', 'Search platform users')
    },
    {
      id: 'cashout' as SendMode,
      icon: Banknote,
      title: t('modes.cashout.title', 'Cash Out'),
      description: t('modes.cashout.description', 'Convert to bank via Coinbase')
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-center">
        {t('modes.title', 'How do you want to send?')}
      </h2>
      
      <div className="space-y-3">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-xl transition-all",
                "bg-card hover:bg-muted/50 active:scale-[0.98]",
                "border border-border hover:border-primary/50"
              )}
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              
              <div className="flex-1 text-left">
                <span className="font-medium block">{mode.title}</span>
                <span className="text-sm text-muted-foreground">{mode.description}</span>
              </div>
              
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SendModeSelector;
