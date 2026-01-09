import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { SecuritySettings, SecurityFormData } from '../types';

// Mock security settings
const defaultSecuritySettings: SecuritySettings = {
  pinEnabled: false,
  twoFactorEnabled: false,
  biometricEnabled: false,
  sessionTimeout: 30,
  loginAlerts: true
};

export function useSecuritySettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(defaultSecuritySettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const loadSecuritySettings = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        // TODO: Load security settings from API
        setSecuritySettings(defaultSecuritySettings);
      } catch (error) {
        console.error('Error loading security settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSecuritySettings();
  }, [user]);

  const updateSecuritySettings = async (formData: SecurityFormData) => {
    if (!user) return;

    try {
      setIsUpdating(true);
      
      // TODO: Update security settings via API
      if (formData.settings) {
        setSecuritySettings(prev => ({ ...prev, ...formData.settings }));
      }

      toast({
        title: "Paramètres de sécurité mis à jour",
        description: "Vos paramètres de sécurité ont été sauvegardés"
      });
    } catch (error) {
      console.error('Error updating security settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres de sécurité",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    securitySettings,
    isLoading,
    isUpdating,
    updateSecuritySettings
  };
}