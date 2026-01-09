export interface UserPreferences {
  id: string;
  userId: string;
  displaySettings: DisplaySettings;
  appSettings: AppSettings;
  createdAt: string;
  updatedAt: string;
}

export interface DisplaySettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
}

export interface AppSettings {
  notifications: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  soundEnabled: boolean;
  autoLogin: boolean;
  biometricAuth: boolean;
}

export interface PreferencesState {
  isLoading: boolean;
  preferences: UserPreferences | null;
  error: string | null;
}