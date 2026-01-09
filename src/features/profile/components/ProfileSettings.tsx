import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useProfileSettings } from '@/features/profile/hooks';
import { useOddsFormat } from '@/contexts/OddsFormatContext';
import { TrendingUp, Globe } from 'lucide-react';
import type { OddsFormat } from '@/types/oddsFormat';
export default function ProfileSettings() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('common');
  const { toast } = useToast();
  const { 
    profile, 
    isUpdating, 
    updateSettings 
  } = useProfileSettings();
  const { format: oddsFormat, setFormat: setOddsFormat } = useOddsFormat();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
  };
  const [formData, setFormData] = useState({
    phone: profile?.phone || ''
  });

  React.useEffect(() => {
    if (profile) {
      setFormData({
        phone: profile.phone || ''
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileUpdate = async () => {
    const result = await updateSettings(formData);
    
    if (result.success) {
      toast({
        title: t('settings.profileUpdated'),
        description: t('settings.profileUpdatedDesc')
      });
    } else {
      const errorMessage = result.error?.includes('duplicate key') 
        ? t('settings.usernameTaken')
        : result.error || t('settings.errorUpdating');
        
      toast({
        title: t('settings.errorTitle'),
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const isFormChanged = profile && (
    formData.phone !== (profile.phone || '')
  );

  if (!profile) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Nom d'utilisateur (lecture seule) */}
      <div className="space-y-2">
        <Label htmlFor="username" className="text-sm font-medium">
          {t('settings.username')}
        </Label>
        <Input
          id="username"
          value={profile.username || ''}
          readOnly
          className="h-10 bg-muted/50 cursor-not-allowed"
          placeholder={t('settings.noUsername')}
        />
      </div>

      {/* Email (lecture seule) */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          {t('settings.email')}
        </Label>
        <Input
          id="email"
          value={profile.email || ''}
          readOnly
          className="h-10 bg-muted/50 cursor-not-allowed"
          placeholder={t('settings.noEmail')}
        />
        <p className="text-xs text-muted-foreground">
          {t('settings.emailHint')}
        </p>
      </div>

      {/* Numéro de téléphone */}
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-medium">
          {t('settings.phone')}
        </Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder={t('settings.phonePlaceholder')}
          className="h-10"
        />
        <p className="text-xs text-muted-foreground">
          {t('settings.phoneHint')}
        </p>
      </div>

      {/* Odds Format */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          {t('settings.oddsFormat')}
        </Label>
        <Select value={oddsFormat} onValueChange={(v: OddsFormat) => setOddsFormat(v)}>
          <SelectTrigger className="h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="decimal">{t('settings.decimal')} (1.50)</SelectItem>
            <SelectItem value="american">{t('settings.american')} (+150)</SelectItem>
            <SelectItem value="fractional">{t('settings.fractional')} (1/2)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {t('settings.oddsFormatHint')}
        </p>
      </div>

      {/* Language Selector */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Globe className="w-4 h-4" />
          {t('settings.language')}
        </Label>
        <Select value={i18n.language.split('-')[0]} onValueChange={handleLanguageChange}>
          <SelectTrigger className="h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">{t('settings.english')}</SelectItem>
            <SelectItem value="fr">{t('settings.french')}</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {t('settings.languageHint')}
        </p>
      </div>

      {/* Bouton de sauvegarde */}
      <Button
        onClick={handleProfileUpdate}
        disabled={isUpdating || !isFormChanged}
        className="w-full h-10"
      >
        {isUpdating ? t('settings.updating') : t('buttons.saveChanges')}
      </Button>
    </div>
  );
}