import React from 'react';
import { cn } from '@/lib/utils';
import { Settings, Dice6, Coins } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface LudoSettingsCardProps {
  extraTurnOnSix: boolean;
  betPerMatch: number;
  onExtraTurnChange: (value: boolean) => void;
  onBetPerMatchChange: (value: number) => void;
}

export const LudoSettingsCard = ({
  extraTurnOnSix,
  betPerMatch,
  onExtraTurnChange,
  onBetPerMatchChange
}: LudoSettingsCardProps) => {
  const hasSideBets = betPerMatch > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Settings className="h-4 w-4" />
        <span>Ludo Settings</span>
      </div>

      {/* Extra turn on 6 */}
      <div className="flex items-center justify-between bg-muted/20 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center",
            extraTurnOnSix ? "bg-primary/20" : "bg-muted/30"
          )}>
            <Dice6 className={cn(
              "h-5 w-5",
              extraTurnOnSix ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          <div>
            <p className="font-medium text-sm">Extra turn on 6</p>
            <p className="text-xs text-muted-foreground">
              Roll again when you get a 6
            </p>
          </div>
        </div>
        <Switch 
          checked={extraTurnOnSix}
          onCheckedChange={onExtraTurnChange}
        />
      </div>

      {/* Side bets per match */}
      <div className="flex items-center justify-between bg-muted/20 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center",
            hasSideBets ? "bg-primary/20" : "bg-muted/30"
          )}>
            <Coins className={cn(
              "h-5 w-5",
              hasSideBets ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          <div>
            <p className="font-medium text-sm">Side bets per match</p>
            <p className="text-xs text-muted-foreground">
              Additional wager between opponents
            </p>
          </div>
        </div>
        <Switch 
          checked={hasSideBets}
          onCheckedChange={(checked) => onBetPerMatchChange(checked ? 1 : 0)}
        />
      </div>

      {hasSideBets && (
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 5, 10].map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => onBetPerMatchChange(amount)}
              className={cn(
                "py-2 rounded-lg text-sm font-medium transition-all duration-200",
                betPerMatch === amount
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              )}
            >
              ${amount}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
