import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, User, Upload, X, Check, Loader2, Camera, Users } from "lucide-react";
import { useAuth } from '@/features/auth';
import { useUserProfile } from '@/features/profile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { calculateAge, MIN_AGE_REQUIREMENT } from '@/utils/ageUtils';
import { DateOfBirthField, PhoneField } from '@/features/auth/fields';
import { OnboardingStepProps } from '../../types';
import { useDebounce } from '@/hooks/useDebounce';
import { useValidateReferralCode, useProcessReferralSignup } from '@/features/mlm/hooks/useReferralCode';
import { getReferralCode, clearReferralCode } from '@/features/mlm/hooks/useReferralStorage';

export function ProfileStep({ onNext, onBack }: OnboardingStepProps) {
  const { user } = useAuth();
  const { profile, isLoading: isProfileLoading } = useUserProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    bio: '',
    phone: '',
    country: 'FR',
    referralCode: '',
  });
  
  // Referral code validation
  const validateReferralCode = useValidateReferralCode();
  const processReferralSignup = useProcessReferralSignup();
  const [referralValidation, setReferralValidation] = useState<{
    isValid: boolean | null;
    referrerUsername: string | null;
    isChecking: boolean;
  }>({ isValid: null, referrerUsername: null, isChecking: false });
  
  const debouncedReferralCode = useDebounce(formData.referralCode, 500);
  
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const debouncedUsername = useDebounce(formData.username, 500);
  const isEmailUser = profile?.auth_method === 'email';

  // Pre-fill form with existing user data
  useEffect(() => {
    if (profile) {
      // Check localStorage for referral code from redirect
      const savedReferralCode = getReferralCode();
      
      setFormData({
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        email: profile.email || '',
        username: profile.username || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        country: profile.country || 'FR',
        referralCode: savedReferralCode || '',
      });
      setDateOfBirth(undefined); // date_of_birth not in ProfileData yet
      setProfilePictureUrl(profile.avatar_url);
    }
  }, [profile]);
  
  // Validate referral code when it changes
  useEffect(() => {
    if (debouncedReferralCode && debouncedReferralCode.length >= 3) {
      setReferralValidation(prev => ({ ...prev, isChecking: true }));
      validateReferralCode.mutate(debouncedReferralCode, {
        onSuccess: (result) => {
          setReferralValidation({
            isValid: result.is_valid,
            referrerUsername: result.referrer_username || null,
            isChecking: false,
          });
        },
        onError: () => {
          setReferralValidation({
            isValid: false,
            referrerUsername: null,
            isChecking: false,
          });
        },
      });
    } else {
      setReferralValidation({ isValid: null, referrerUsername: null, isChecking: false });
    }
  }, [debouncedReferralCode]);

  // Recharger le téléphone quand il change (après vérification SMS)
  useEffect(() => {
    if (profile?.phone && profile.phone !== formData.phone) {
      setFormData(prev => ({ 
        ...prev, 
        phone: profile.phone || '' 
      }));
    }
  }, [profile]);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Debounced username check
  useEffect(() => {
    if (debouncedUsername && debouncedUsername.length >= 3) {
      if (debouncedUsername === profile?.username) {
        setUsernameAvailable(true);
        setIsCheckingUsername(false);
      } else {
        checkUsernameAvailability(debouncedUsername);
      }
    } else {
      setUsernameAvailable(null);
      setIsCheckingUsername(false);
    }
  }, [debouncedUsername, profile?.username]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
    
    if (field === 'username') {
      setUsernameAvailable(null);
      setIsCheckingUsername(value.length >= 3 && value !== (profile?.username || ''));
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size cannot exceed 5MB');
      return;
    }

    setUploadError(null);
    
    // Create local preview (no upload yet)
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSelectedAvatarFile(file);
    
    toast.success('Photo selected - will be uploaded when you click "Continue"');
  };

  const checkUsernameAvailability = async (username: string) => {
    if (username === profile?.username) {
      setUsernameAvailable(true);
      return;
    }

    setIsCheckingUsername(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();

      setUsernameAvailable(!data);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'PGRST116') {
        setUsernameAvailable(true);
      } else {
        console.error('Error checking username:', error);
      }
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!profilePictureUrl) return;
    
    try {
      if (profilePictureUrl.includes('avatars/')) {
        const urlParts = profilePictureUrl.split('/avatars/');
        if (urlParts[1]) {
          await supabase.storage.from('avatars').remove([urlParts[1]]);
        }
      }
      setProfilePictureUrl(null);
      toast.success('Profile photo removed');
    } catch (error) {
      console.error('Error removing photo:', error);
      toast.error('Error during deletion');
    }
  };

  const handleContinue = async () => {
    // 1. Data validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    
    if (!isEmailUser && !formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isEmailUser && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must contain at least 3 characters';
    } else if (formData.username.length > 20) {
      newErrors.username = 'Username cannot exceed 20 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers and underscores';
    } else if (usernameAvailable === false) {
      newErrors.username = 'This username is not available';
    }
    
    // Date of birth optional, but if provided, must respect minimum age
    if (dateOfBirth) {
      const age = calculateAge(dateOfBirth);
      if (age < MIN_AGE_REQUIREMENT) {
        newErrors.dateOfBirth = `You must be at least ${MIN_AGE_REQUIREMENT} years old`;
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please correct the errors in the form');
      return;
    }

    // 2. Final username verification if not done yet
    if (formData.username !== profile?.username && usernameAvailable === null) {
      toast.error('Checking username availability...');
      return;
    }

    setIsLoading(true);

    try {
      let finalAvatarUrl = profilePictureUrl;
      
      // Upload avatar if new file selected
      if (selectedAvatarFile) {
        setIsUploading(true);
        
        try {
          // Remove old image if exists
          if (profilePictureUrl && profilePictureUrl.includes('avatars/')) {
            const urlParts = profilePictureUrl.split('/avatars/');
            if (urlParts[1]) {
              await supabase.storage.from('avatars').remove([urlParts[1]]);
            }
          }

          // Upload new image
          const fileExt = selectedAvatarFile.name.split('.').pop();
          const fileName = `${user?.id}/${Date.now()}.${fileExt}`;

          const { error: uploadError, data } = await supabase.storage
            .from('avatars')
            .upload(fileName, selectedAvatarFile);

          if (uploadError) throw uploadError;

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

          finalAvatarUrl = publicUrl;
        } catch (error) {
          console.error('Error uploading avatar:', error);
          toast.error('Error uploading photo');
          setIsUploading(false);
          setIsLoading(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }
      
      // 3. Préparation des données
      const [firstName, ...lastNameParts] = formData.name.trim().split(' ');
      const lastName = lastNameParts.join(' ');
      
      interface UserUpdateData {
        first_name: string;
        last_name: string | null;
        username: string;
        bio: string | null;
        avatar_url: string | null;
        date_of_birth: string | undefined;
        phone?: string | null; // Optionnel car sauvegardé après vérification SMS
        country: string;
        email?: string;
      }
      
      const updateData: UserUpdateData = {
        first_name: firstName || formData.name.trim(),
        last_name: lastName || null,
        username: formData.username,
        bio: formData.bio || null,
        avatar_url: finalAvatarUrl,
        date_of_birth: dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : null,
        // Ne pas sauvegarder le téléphone ici - il sera sauvegardé après vérification SMS
        country: formData.country,
      };

      if (!isEmailUser) {
        updateData.email = formData.email;
      }

      // 4. Sauvegarde en base de données
      const { error, data } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user?.id)
        .select('id, username')
        .single();

      if (error) {
        console.error('Database error:', error);
        
        // Specific error messages
        if (error.code === '23505' && error.message.includes('username')) {
          throw new Error('This username is already taken');
        } else if (error.code === '23505' && error.message.includes('email')) {
          throw new Error('This email address is already in use');
        } else if (error.code === '23514') {
          throw new Error('Invalid data. Please check your information');
        } else {
          throw new Error('Error saving profile');
        }
      }

      // 5. Save verification
      if (!data?.id) {
        throw new Error('Save confirmation error');
      }

      // 6. Process referral code if valid
      if (formData.referralCode && referralValidation.isValid && user?.id) {
        try {
          await processReferralSignup.mutateAsync({
            referredId: user.id,
            code: formData.referralCode,
          });
          clearReferralCode(); // Clear from localStorage after processing
          toast.success('Referral code applied successfully!');
        } catch (refError) {
          console.warn('Referral processing failed:', refError);
          // Don't block onboarding if referral fails
        }
      }

      // 7. Success
      toast.success('Profile updated successfully!');
      
      // 8. Navigate to next step
      onNext?.();
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      
      // User error messages
      const errorMessage = error.message || 'Error updating profile';
      toast.error(errorMessage);
      
      // Specific handling of username errors
      if (errorMessage.includes('username') || errorMessage.includes('nom d\'utilisateur')) {
        setUsernameAvailable(false);
        setErrors(prev => ({ ...prev, username: errorMessage }));
      }
      
    } finally {
      setIsLoading(false);
    }
  };

  const canContinue = formData.name.trim() && 
    (isEmailUser || formData.email.trim()) && 
    formData.username.trim() && 
    formData.username.length >= 3 &&
    usernameAvailable !== false &&
    !isLoading &&
    !isUploading;

  // Display loader during profile loading
  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">Loading profile</h2>
            <p className="text-muted-foreground text-sm">Retrieving your information...</p>
          </div>
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 flex flex-col relative"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/20">
        <div className="flex items-center px-4 py-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="min-h-[44px] min-w-[44px] rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex-1 text-center px-4">
            <h1 className="text-lg font-semibold text-foreground">
              {profile?.auth_method === 'wallet' ? 'Wallet Profile' : 'Profile'}
            </h1>
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <div className="h-1.5 w-8 rounded-full bg-primary"></div>
              <div className="h-1.5 w-6 rounded-full bg-muted"></div>
              <div className="h-1.5 w-6 rounded-full bg-muted"></div>
              <div className="h-1.5 w-6 rounded-full bg-muted"></div>
            </div>
          </div>
          
          <div className="w-11"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 overflow-y-auto overscroll-contain">
        <div className="max-w-sm mx-auto space-y-8">
          {/* Profile Picture Section */}
          <div className="space-y-4 text-center">
            <Label className="text-base font-semibold">Profile picture</Label>
            <div className="flex justify-center">
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isUploading}
                />
                
                <div 
                  className="relative cursor-pointer group"
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                >
                  <Avatar className="w-24 h-24 border-2 border-border group-hover:border-primary/50 transition-colors">
                    <AvatarImage 
                      src={previewUrl || profilePictureUrl || ''} 
                      alt="Profile picture"
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-muted">
                      <User className="w-10 h-10 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Camera overlay */}
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  
                  {/* Loading overlay */}
                  {isUploading && (
                    <div className="absolute inset-0 bg-background/80 rounded-full flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  )}
                  
                  {/* Remove button */}
                  {profilePictureUrl && !isUploading && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePhoto();
                      }}
                      className="absolute -top-1 -right-1 bg-destructive hover:bg-destructive/90 text-white rounded-full p-1 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Click to {profilePictureUrl ? 'update' : 'add'} your photo
            </p>
            
            {uploadError && (
              <p className="text-sm text-destructive">{uploadError}</p>
            )}
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-semibold">
              Full name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your full name"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-semibold">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="your.email@example.com"
              className={errors.email ? 'border-destructive' : ''}
              disabled={isEmailUser}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            {isEmailUser && (
              <p className="text-xs text-muted-foreground">
                Email cannot be modified for this account type
              </p>
            )}
          </div>

          {/* Username Field */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-base font-semibold">
              Username <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => {
                  const sanitized = e.target.value
                    .toLowerCase()
                    .replace(/\s+/g, '')
                    .replace(/[^a-z0-9_-]/g, '');
                  handleInputChange('username', sanitized);
                }}
                placeholder="username"
                className={`pr-10 ${errors.username ? 'border-destructive' : usernameAvailable === true ? 'border-green-500' : usernameAvailable === false ? 'border-destructive' : ''}`}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {isCheckingUsername ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : usernameAvailable === true ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : usernameAvailable === false ? (
                  <X className="w-4 h-4 text-destructive" />
                ) : null}
              </div>
            </div>
            {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
            {usernameAvailable === false && (
              <p className="text-sm text-destructive">This username is not available</p>
            )}
            
            {/* Username preview and v2 address note */}
            {formData.username && (
              <div className="space-y-1 mt-2">
                <p className="text-sm font-mono text-primary">
                  {formData.username}.pryzen.eth
                </p>
                <p className="text-xs text-muted-foreground">
                  This username will be used to generate your v2 address
                </p>
              </div>
            )}
          </div>

          {/* Date of Birth Field */}
          <div className="space-y-2">
            <DateOfBirthField 
              dateOfBirth={dateOfBirth}
              onDateChange={setDateOfBirth}
            />
            {errors.dateOfBirth && (
              <p className="text-sm text-destructive">{errors.dateOfBirth}</p>
            )}
          </div>

          {/* Phone Field */}
          <PhoneField 
            phone={formData.phone}
            onPhoneChange={(value) => handleInputChange('phone', value)}
            country={formData.country}
            onCountryChange={(country) => handleInputChange('country', country)}
            showVerifyButton={true}
            returnTo="/onboarding/profile"
            isVerified={profile?.phone_verified || false}
          />

          {/* Referral Code Field */}
          <div className="space-y-2">
            <Label htmlFor="referralCode" className="text-base font-semibold">
              Referral Code <span className="text-muted-foreground text-sm font-normal">(optional)</span>
            </Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="referralCode"
                value={formData.referralCode}
                onChange={(e) => handleInputChange('referralCode', e.target.value.toUpperCase())}
                placeholder="Enter a referral code"
                className={`pl-10 pr-10 ${
                  referralValidation.isValid === true ? 'border-green-500' : 
                  referralValidation.isValid === false ? 'border-destructive' : ''
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {referralValidation.isChecking ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : referralValidation.isValid === true ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : referralValidation.isValid === false ? (
                  <X className="w-4 h-4 text-destructive" />
                ) : null}
              </div>
            </div>
            {referralValidation.isValid === true && referralValidation.referrerUsername && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <Check className="w-3 h-3" />
                Referred by <span className="font-semibold">@{referralValidation.referrerUsername}</span>
              </p>
            )}
            {referralValidation.isValid === false && formData.referralCode && (
              <p className="text-xs text-destructive">Invalid referral code</p>
            )}
          </div>

          {/* Bio Field */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-base font-semibold">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us a bit about yourself..."
              rows={3}
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground text-right">
              {formData.bio.length}/160 characters
            </p>
          </div>

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