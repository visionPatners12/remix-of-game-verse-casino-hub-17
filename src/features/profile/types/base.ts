// Base profile interfaces

export interface BaseProfileData {
  id: string;
  username?: string;
  ens_subdomain?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string | null;
  bio?: string;
  country?: string;
  is_profile_public?: boolean;
  auth_method?: 'email' | 'wallet';
  created_at?: string;
  updated_at?: string;
}

export interface BaseCountryOption {
  value: string;
  label: string;
  dialCode: string;
}