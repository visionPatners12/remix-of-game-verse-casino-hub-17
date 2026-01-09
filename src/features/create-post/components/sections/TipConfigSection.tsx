import React from 'react';
import { Lock } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface TipConfigSectionProps {
  isPremiumTip: boolean;
  hasTipsterProfile: boolean;
  onTogglePremiumTip: (value: boolean) => void;
}

export function TipConfigSection({ 
  isPremiumTip, 
  hasTipsterProfile,
  onTogglePremiumTip
}: TipConfigSectionProps) {
  if (!hasTipsterProfile) return null;

  return (
    <div className="flex items-center gap-3 mb-4">
      <Switch 
        checked={isPremiumTip} 
        onCheckedChange={onTogglePremiumTip} 
      />
      <Label className="text-sm font-medium">Premium</Label>
      {isPremiumTip && (
        <Badge className="bg-amber-500 hover:bg-amber-600 text-xs py-0.5">
          <Lock className="h-3 w-3 mr-1" /> Premium
        </Badge>
      )}
    </div>
  );
}
