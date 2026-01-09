import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Key } from 'lucide-react';
import { SecuritySettings as SettingsType } from '../types';

interface SecuritySettingsProps {
  settings: SettingsType;
  onUpdate: (updates: Partial<SettingsType>) => Promise<void>;
  onManagePin: () => void;
  isUpdating?: boolean;
}

export function SecuritySettings({ 
  settings, 
  onUpdate, 
  onManagePin, 
  isUpdating = false 
}: SecuritySettingsProps) {
  return (
    <div>
      {/* PIN Security */}
      <div className="py-4 px-4">
        <div className="mb-4 flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-base font-semibold">PIN Code</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Secure important actions with a PIN code
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Label>PIN enabled</Label>
            <p className="text-sm text-muted-foreground">
              {settings.pinEnabled ? 'PIN configured and active' : 'No PIN configured'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={settings.pinEnabled}
              onCheckedChange={(checked) => onUpdate({ pinEnabled: checked })}
              disabled={isUpdating}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={onManagePin}
            >
              Manage
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
