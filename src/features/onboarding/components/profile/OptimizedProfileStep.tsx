import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from '@/features/auth';
import { useUserProfile } from '@/features/profile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { OnboardingStepProps } from '../../types';
import { ProfilePictureUpload } from './ProfilePictureUpload';
import { UserForm } from './UserForm';
import { useProfileUpload } from '../../hooks/useProfileUpload';
import { useUsernameValidation } from '../../hooks/useUsernameValidation';

export function OptimizedProfileStep({ onNext, onBack }: OnboardingStepProps) {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    bio: '',
    phone: '',
    country: 'FR',
  });
  
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasExistingUsername, setHasExistingUsername] = useState(false);
  
  const isPrivyUser = user?.user_metadata?.auth_method === 'privy';

  // Optimized hooks
  const {
    isUploading,
    uploadError,
    uploadProfilePicture,
    removeProfilePicture,
    setUploadError,
  } = useProfileUpload();

  const {
    isChecking: isCheckingUsername,
    isAvailable: usernameAvailable,
    checkUsernameAvailability,
    resetValidation,
  } = useUsernameValidation();

  // Pre-fill form with existing user data
  useEffect(() => {
    if (profile) {
      setFormData({
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        email: profile.email || '',
        username: profile.username || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        country: profile.country || 'FR',
      });
      
      // Load date of birth if it exists
      if (profile.date_of_birth) {
        setDateOfBirth(new Date(profile.date_of_birth));
      }
      
      // Track if username already exists (cannot be changed)
      if (profile.username && profile.username.trim().length > 0) {
        setHasExistingUsername(true);
      }
      
      setProfilePictureUrl(profile.avatar_url);
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
    
    if (field === 'username' && value !== (profile?.username || '')) {
      resetValidation();
      if (value.length >= 3) {
        checkUsernameAvailability(value);
      }
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    const newUrl = await uploadProfilePicture(file, profilePictureUrl);
    if (newUrl) {
      setProfilePictureUrl(newUrl);
    }
  };

  const handleRemovePhoto = async () => {
    if (!profilePictureUrl) return;
    
    const success = await removeProfilePicture(profilePictureUrl);
    if (success) {
      setProfilePictureUrl(null);
    }
  };

  const handleContinue = async () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    
    if (!isPrivyUser && !formData.email.trim()) {
      newErrors.email = 'Email is required';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (usernameAvailable === false) {
      newErrors.username = 'This username is not available';
    }
    
    if (!dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const age = new Date().getFullYear() - dateOfBirth.getFullYear();
      if (age < 18) {
        newErrors.dateOfBirth = 'You must be at least 18 years old';
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const [firstName, ...lastNameParts] = formData.name.trim().split(' ');
      const lastName = lastNameParts.join(' ');
      
      interface UserUpdateData {
        first_name: string;
        last_name: string | null;
        username: string;
        bio: string | null;
        avatar_url: string | null;
        date_of_birth: string | undefined;
        phone: string | null;
        country: string;
        email?: string;
      }
      
      const updateData: UserUpdateData = {
        first_name: firstName || formData.name.trim(),
        last_name: lastName || null,
        username: formData.username,
        bio: formData.bio || null,
        avatar_url: profilePictureUrl,
        date_of_birth: dateOfBirth?.toISOString().split('T')[0],
        phone: formData.phone || null,
        country: formData.country,
      };

      if (!isPrivyUser) {
        updateData.email = formData.email;
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user?.id);

      if (error) {
        throw error;
      }

      toast.success('Profile updated successfully!');
      onNext?.();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  const canContinue = useMemo(() => 
    formData.name.trim() && 
    (isPrivyUser || formData.email.trim()) && 
    formData.username.trim() && 
    formData.username.length >= 3 &&
    usernameAvailable !== false &&
    dateOfBirth &&
    !isLoading &&
    !isUploading,
    [formData, isPrivyUser, usernameAvailable, dateOfBirth, isLoading, isUploading]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 flex flex-col relative">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/20">
        <div className="flex items-center px-4 py-3 safe-area-inset-top">
          <Button variant="ghost" size="lg" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex-1 text-center px-4">
            <h1 className="text-lg font-semibold text-foreground">
              {isPrivyUser ? 'Wallet Profile' : 'Profile'}
            </h1>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="h-1 w-8 rounded-full bg-primary"></div>
              <div className="h-1 w-8 rounded-full bg-muted"></div>
              <div className="h-1 w-8 rounded-full bg-muted"></div>
              <div className="h-1 w-8 rounded-full bg-muted"></div>
              <div className="h-1 w-8 rounded-full bg-muted"></div>
              <div className="h-1 w-8 rounded-full bg-muted"></div>
              <div className="h-1 w-8 rounded-full bg-muted"></div>
            </div>
          </div>
          
          <div className="w-[44px]"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8 pb-safe overflow-y-auto">
        <div className="max-w-sm mx-auto space-y-8">
          {/* Profile Picture Section */}
          <ProfilePictureUpload
            profilePictureUrl={profilePictureUrl}
            isUploading={isUploading}
            uploadError={uploadError}
            onFileSelect={handleFileSelect}
            onRemovePhoto={handleRemovePhoto}
          />

          {/* User Form */}
          <UserForm
            formData={formData}
            errors={errors}
            isPrivyUser={isPrivyUser}
            isCheckingUsername={isCheckingUsername}
            usernameAvailable={usernameAvailable}
            dateOfBirth={dateOfBirth}
            isPhoneVerified={profile?.phone_verified || false}
            onInputChange={handleInputChange}
            onDateChange={setDateOfBirth}
            isUsernameDisabled={hasExistingUsername}
          />

          {/* Continue Button */}
          <div className="pt-4">
            <Button
              onClick={handleContinue}
              disabled={!canContinue}
              className="w-full min-h-[52px] text-base font-semibold rounded-xl shadow-lg"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  Saving...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}