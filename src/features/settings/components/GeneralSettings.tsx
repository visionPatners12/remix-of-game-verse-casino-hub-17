import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { GeneralSettings as SettingsType } from '../types';
import { useOddsFormat } from '@/contexts/OddsFormatContext';
import type { OddsFormat } from '@/types/oddsFormat';

interface GeneralSettingsProps {
  settings: SettingsType;
  onUpdate: (updates: Partial<SettingsType>) => Promise<void>;
  isUpdating?: boolean;
}

export function GeneralSettings({ settings, onUpdate, isUpdating = false }: GeneralSettingsProps) {
  const { format: oddsFormat, setFormat: setOddsFormat } = useOddsFormat();

  return (
    <div className="space-y-6">
      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Apparence</CardTitle>
          <CardDescription>
            Personnalisez l'affichage de l'application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Thème</Label>
              <p className="text-sm text-muted-foreground">
                Choisissez le thème de l'application
              </p>
            </div>
            <Select
              value={settings.theme}
              onValueChange={(value: 'light' | 'dark' | 'system') => 
                onUpdate({ theme: value })
              }
              disabled={isUpdating}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Clair</SelectItem>
                <SelectItem value="dark">Sombre</SelectItem>
                <SelectItem value="system">Système</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Langue</Label>
              <p className="text-sm text-muted-foreground">
                Langue de l'interface
              </p>
            </div>
            <Select
              value={settings.language}
              onValueChange={(value) => onUpdate({ language: value })}
              disabled={isUpdating}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Odds Format</Label>
              <p className="text-sm text-muted-foreground">
                How betting odds are displayed
              </p>
            </div>
            <Select
              value={oddsFormat}
              onValueChange={(value: OddsFormat) => setOddsFormat(value)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="decimal">Decimal (1.50)</SelectItem>
                <SelectItem value="american">American (+150)</SelectItem>
                <SelectItem value="fractional">Fractional (1/2)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader>
          <CardTitle>Confidentialité</CardTitle>
          <CardDescription>
            Contrôlez qui peut voir vos informations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Visibilité du profil</Label>
              <p className="text-sm text-muted-foreground">
                Qui peut voir votre profil
              </p>
            </div>
            <Select
              value={settings.privacy.profileVisibility}
              onValueChange={(value: 'public' | 'friends' | 'private') => 
                onUpdate({ 
                  privacy: { 
                    ...settings.privacy, 
                    profileVisibility: value 
                  } 
                })
              }
              disabled={isUpdating}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="friends">Amis</SelectItem>
                <SelectItem value="private">Privé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Afficher l'activité</Label>
              <p className="text-sm text-muted-foreground">
                Permettre aux autres de voir votre activité
              </p>
            </div>
            <Switch
              checked={settings.privacy.showActivity}
              onCheckedChange={(checked) => 
                onUpdate({ 
                  privacy: { 
                    ...settings.privacy, 
                    showActivity: checked 
                  } 
                })
              }
              disabled={isUpdating}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Afficher les statistiques</Label>
              <p className="text-sm text-muted-foreground">
                Rendre vos stats publiques
              </p>
            </div>
            <Switch
              checked={settings.privacy.showStats}
              onCheckedChange={(checked) => 
                onUpdate({ 
                  privacy: { 
                    ...settings.privacy, 
                    showStats: checked 
                  } 
                })
              }
              disabled={isUpdating}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}