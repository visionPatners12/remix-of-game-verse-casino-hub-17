import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { AppSettings as AppSettingsType } from '../types';

interface AppSettingsProps {
  settings?: AppSettingsType;
  onUpdate: (settings: AppSettingsType) => void;
  isLoading: boolean;
}

export const AppSettings = ({ settings, onUpdate, isLoading }: AppSettingsProps) => {
  const handleSettingChange = (key: keyof AppSettingsType, value: boolean) => {
    if (settings) {
      onUpdate({ ...settings, [key]: value });
    }
  };

  if (!settings) {
    return <div>Loading app settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label htmlFor="notifications">Notifications</Label>
        <Switch
          id="notifications"
          checked={settings.notifications}
          onCheckedChange={(value) => handleSettingChange('notifications', value)}
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="pushNotifications">Push Notifications</Label>
        <Switch
          id="pushNotifications"
          checked={settings.pushNotifications}
          onCheckedChange={(value) => handleSettingChange('pushNotifications', value)}
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="emailNotifications">Email Notifications</Label>
        <Switch
          id="emailNotifications"
          checked={settings.emailNotifications}
          onCheckedChange={(value) => handleSettingChange('emailNotifications', value)}
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="soundEnabled">Sound</Label>
        <Switch
          id="soundEnabled"
          checked={settings.soundEnabled}
          onCheckedChange={(value) => handleSettingChange('soundEnabled', value)}
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="autoLogin">Auto Login</Label>
        <Switch
          id="autoLogin"
          checked={settings.autoLogin}
          onCheckedChange={(value) => handleSettingChange('autoLogin', value)}
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="biometricAuth">Biometric Authentication</Label>
        <Switch
          id="biometricAuth"
          checked={settings.biometricAuth}
          onCheckedChange={(value) => handleSettingChange('biometricAuth', value)}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};