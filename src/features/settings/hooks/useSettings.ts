import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { GeneralSettings, SettingsFormData } from '../types';

// Mock settings - replace with real API
const defaultSettings: GeneralSettings = {
  language: 'fr',
  theme: 'system',
  notifications: {
    email: true,
    push: true,
    marketing: false,
    security: true,
    tips: true
  },
  privacy: {
    profileVisibility: 'public',
    showActivity: true,
    showStats: true,
    allowMessages: true
  }
};

export function useSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<GeneralSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        // TODO: Load settings from API
        // const { data } = await settingsService.getSettings(user.id);
        // setSettings(data || defaultSettings);
        setSettings(defaultSettings);
      } catch (error) {
        console.error('Error loading settings:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les paramètres",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user, toast]);

  const updateSettings = async (formData: SettingsFormData) => {
    if (!user) return;

    try {
      setIsUpdating(true);
      
      // TODO: Update settings via API
      // await settingsService.updateSettings(user.id, formData);
      
      // Update local state
      setSettings(prev => ({
        ...prev,
        ...formData.general,
        notifications: { ...prev.notifications, ...formData.notifications },
        privacy: { ...prev.privacy, ...formData.privacy }
      }));

      toast({
        title: "Paramètres mis à jour",
        description: "Vos paramètres ont été sauvegardés avec succès"
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    settings,
    isLoading,
    isUpdating,
    updateSettings
  };
}