import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { DisplaySettings as DisplaySettingsType } from '../types';

interface DisplaySettingsProps {
  settings?: DisplaySettingsType;
  onUpdate: (settings: DisplaySettingsType) => void;
  isLoading: boolean;
}

export const DisplaySettings = ({ settings, onUpdate, isLoading }: DisplaySettingsProps) => {
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    if (settings) {
      onUpdate({ ...settings, theme });
    }
  };

  const handleLanguageChange = (language: string) => {
    if (settings) {
      onUpdate({ ...settings, language });
    }
  };

  const handleFontSizeChange = (fontSize: 'small' | 'medium' | 'large') => {
    if (settings) {
      onUpdate({ ...settings, fontSize });
    }
  };

  const handleHighContrastChange = (highContrast: boolean) => {
    if (settings) {
      onUpdate({ ...settings, highContrast });
    }
  };

  if (!settings) {
    return <div>Loading display settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="theme">Theme</Label>
        <Select value={settings.theme} onValueChange={handleThemeChange} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder="Select theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="language">Language</Label>
        <Select value={settings.language} onValueChange={handleLanguageChange} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="fr">Français</SelectItem>
            <SelectItem value="es">Español</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fontSize">Font Size</Label>
        <Select value={settings.fontSize} onValueChange={handleFontSizeChange} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder="Select font size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="large">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="highContrast">High Contrast</Label>
        <Switch
          id="highContrast"
          checked={settings.highContrast}
          onCheckedChange={handleHighContrastChange}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};