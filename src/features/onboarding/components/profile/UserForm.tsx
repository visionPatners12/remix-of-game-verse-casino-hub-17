import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, X, Loader2 } from "lucide-react";
import { DateOfBirthField, PhoneField } from '@/features/auth/fields';

interface FormData {
  name: string;
  email: string;
  username: string;
  bio: string;
  phone: string;
  country: string;
}

interface UserFormProps {
  formData: FormData;
  errors: Record<string, string>;
  isPrivyUser: boolean;
  isCheckingUsername: boolean;
  usernameAvailable: boolean | null;
  dateOfBirth: Date | undefined;
  isPhoneVerified: boolean;
  onInputChange: (field: string, value: string) => void;
  onDateChange: (date: Date | undefined) => void;
}

export function UserForm({
  formData,
  errors,
  isPrivyUser,
  isCheckingUsername,
  usernameAvailable,
  dateOfBirth,
  isPhoneVerified,
  onInputChange,
  onDateChange,
}: UserFormProps) {
  return (
    <div className="space-y-6">
      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-base font-semibold">
          Full Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onInputChange('name', e.target.value)}
          placeholder="Enter your full name"
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      {/* Email Field (only for non-Privy users) */}
      {!isPrivyUser && (
        <div className="space-y-2">
          <Label htmlFor="email" className="text-base font-semibold">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onInputChange('email', e.target.value)}
            placeholder="your.email@example.com"
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>
      )}

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
              onInputChange('username', sanitized);
            }}
            placeholder="username"
            className={`pr-10 ${
              errors.username ? 'border-destructive' : 
              usernameAvailable === true ? 'border-green-500' : 
              usernameAvailable === false ? 'border-destructive' : ''
            }`}
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
      </div>

      {/* Date of Birth Field */}
      <div className="space-y-2">
        <DateOfBirthField 
          dateOfBirth={dateOfBirth}
          onDateChange={onDateChange}
        />
        {errors.dateOfBirth && (
          <p className="text-sm text-destructive">{errors.dateOfBirth}</p>
        )}
      </div>

      {/* Phone Field */}
      <PhoneField 
        phone={formData.phone}
        onPhoneChange={(value) => onInputChange('phone', value)}
        country={formData.country}
        onCountryChange={(country) => onInputChange('country', country)}
        showVerifyButton={true}
        returnTo="/onboarding/profile"
        isVerified={isPhoneVerified}
      />

      {/* Bio Field */}
      <div className="space-y-2">
        <Label htmlFor="bio" className="text-base font-semibold">Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => onInputChange('bio', e.target.value)}
          placeholder="Tell us a little about yourself..."
          rows={3}
          maxLength={160}
        />
        <p className="text-xs text-muted-foreground text-right">
          {formData.bio.length}/160 characters
        </p>
      </div>
    </div>
  );
}
