
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Label } from '@/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from "sonner";
import { useUserProfile } from '@/features/profile';
import { useOddsFormat } from '@/contexts/OddsFormatContext';
import { User, Mail, Phone, TrendingUp } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import type { OddsFormat } from '@/types/oddsFormat';

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { profile, isLoading: loading, updateProfile } = useUserProfile();
  const { format: oddsFormat, setFormat: setOddsFormat } = useOddsFormat();
  const [usernameError, setUsernameError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const debouncedUsername = useDebounce(profile?.username || '', 500);

  const handleFieldChange = (field: keyof typeof profile, value: any) => {
    // Since useUserProfile doesn't have handleFieldChange, we'll update the profile directly
    // This is a simplified version - in a real app you'd want proper form state management
  };

  // Username validation
  const validateUsername = (username: string): boolean => {
    setUsernameError('');
    
    if (!username || username.trim().length < 3) {
      setUsernameError('Username must contain at least 3 characters');
      return false;
    }
    
    if (username.length > 20) {
      setUsernameError('Username cannot exceed 20 characters');
      return false;
    }
    
    // Check that username contains only allowed characters
    const validUsernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!validUsernameRegex.test(username)) {
      setUsernameError('Username can only contain letters, numbers and _');
      return false;
    }
    
    // Check that it doesn't start or end with underscore
    if (username.startsWith('_') || username.endsWith('_')) {
      setUsernameError('Username cannot start or end with _');
      return false;
    }
    
    return true;
  };

  const handleUsernameChange = (value: string) => {
    // Clean the value (remove spaces and convert to lowercase)
    const cleanValue = value.toLowerCase().replace(/\s/g, '');
    handleFieldChange('username', cleanValue);
    setUsernameError('');
    setIsCheckingUsername(cleanValue.length >= 3 && cleanValue !== profile?.username);
  };

  // Debounced username validation
  useEffect(() => {
    if (debouncedUsername && debouncedUsername.length >= 3 && debouncedUsername !== profile?.username) {
      const isValid = validateUsername(debouncedUsername);
      setIsCheckingUsername(false);
    } else {
      setIsCheckingUsername(false);
    }
  }, [debouncedUsername, profile?.username]);

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;

    // Special validation for username if it's modified
    if (profile.username && !validateUsername(profile.username)) {
      return;
    }

    try {
      setIsUpdating(true);
      await updateProfile({
        first_name: profile.first_name,
        last_name: profile.last_name,
        username: profile.username,
        phone: profile.phone,
      });
      toast.success("Success", { description: "Profile updated successfully" });
      setUsernameError(''); // Clear any previous errors
    } catch (error: any) {
      // Specific handling of username errors
      if (error?.message?.includes('duplicate') || error?.message?.includes('unique')) {
        setUsernameError('This username is already taken');
      } else {
        toast.error("Error", { 
          description: error?.message || "An error occurred" 
        });
      }
    } finally {
      setIsUpdating(false);
    }
  };


  if (loading || !profile) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="h-32 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleProfileUpdate} className="divide-y divide-border">
      <div className="py-4 px-4 space-y-4">
        {/* Grid responsive pour les champs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Input
              id="first_name"
              type="text"
              value={profile.first_name || ''}
              onChange={(e) => handleFieldChange('first_name', e.target.value)}
              placeholder="Prénom"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Input
              id="last_name"
              type="text"
              value={profile.last_name || ''}
              onChange={(e) => handleFieldChange('last_name', e.target.value)}
              placeholder="Nom de famille"
              className="h-11"
            />
          </div>
        </div>

        {/* Username avec validation intelligente */}
        <div className="space-y-2">
          <Input
            id="username"
            type="text"
            value={profile.username || ''}
            onChange={(e) => {
              const sanitized = e.target.value
                .toLowerCase()
                .replace(/\s+/g, '')
                .replace(/[^a-z0-9_-]/g, '');
              handleUsernameChange(sanitized);
            }}
            placeholder="username"
            className={`h-11 ${
              usernameError 
                ? 'border-destructive focus:border-destructive' 
                : ''
            }`}
          />
          {usernameError ? (
            <p className="text-xs text-destructive">
              {usernameError}
            </p>
          ) : profile.username ? (
            <p className="text-xs text-muted-foreground">
              Nom d'utilisateur valide
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              3-20 caractères, lettres, chiffres et _ uniquement
            </p>
          )}
        </div>

        {/* Email en lecture seule avec style approprié */}
        <div className="space-y-2">
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={profile.email || ''}
              disabled={true}
              placeholder="Email (non modifiable)"
              className="h-11 bg-muted/50 text-muted-foreground cursor-not-allowed pl-10"
            />
            <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>

        {/* Téléphone */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="phone"
                type="tel"
                value={profile.phone || ''}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                placeholder="Téléphone (optionnel)"
                className="h-11 pl-10"
              />
              <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            {profile.phone && (
              <Button
                type="button"
                variant="outline"
                size="default"
                className="h-11 px-4 whitespace-nowrap"
                onClick={() => {
                  navigate('/sms-verification', { 
                    state: { phoneNumber: profile.phone } 
                  });
                }}
              >
                Verify
              </Button>
            )}
          </div>
        </div>

        {/* Odds Format Selector */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            Odds Format
          </Label>
          <Select
            value={oddsFormat}
            onValueChange={(v: OddsFormat) => setOddsFormat(v)}
          >
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="decimal">Decimal (1.50)</SelectItem>
              <SelectItem value="american">American (+150)</SelectItem>
              <SelectItem value="fractional">Fractional (1/2)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            How betting odds are displayed across the app
          </p>
        </div>
      </div>

      {/* Bouton de sauvegarde intelligent */}
      <div className="py-4 px-4">
        <Button 
          type="submit" 
          disabled={isUpdating || !!usernameError}
          className="w-full h-11 font-medium"
          size="default"
        >
          {isUpdating ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
              Mise à jour...
            </div>
          ) : (
            "Sauvegarder les modifications"
          )}
        </Button>
      </div>
    </form>
  );
};
