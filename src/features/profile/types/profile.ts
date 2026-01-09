// Unified Profile Types - Consolidates all profile-related interfaces

import { BaseProfileData, BaseCountryOption } from './base';

// Main profile interface extending base
export interface ProfileData extends BaseProfileData {
  favorite_team?: string[];
  favorite_sport?: string[];
  favorite_leagues?: number[];
  is_connected?: boolean;
  phone_number?: string; // Alias for phone
  profile_picture_url?: string | null; // Alias for avatar_url
  phone_verified?: boolean; // Phone verification status
}

// Country option interface (consolidates 3 duplicated versions)
export interface CountryOption extends BaseCountryOption {}

// Profile form data
export interface ProfileFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  username: string;
  bio?: string;
  favorite_team?: string[];
  favorite_sport?: string[];
  favorite_leagues?: number[];
  is_profile_public?: boolean;
}

// Profile state for components
export interface ProfileState {
  profile: ProfileData | null;
  isLoading: boolean;
  error: string | null;
  isEditing: boolean;
}

// Profile actions
export interface ProfileActions {
  updateProfile: (data: Partial<ProfileData>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  deleteAvatar: () => Promise<void>;
  togglePublicProfile: () => Promise<void>;
}