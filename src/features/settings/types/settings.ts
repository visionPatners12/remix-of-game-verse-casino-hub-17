// Settings types
export interface GeneralSettings {
  language: string;
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  marketing: boolean;
  security: boolean;
  tips: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showActivity: boolean;
  showStats: boolean;
  allowMessages: boolean;
}

export interface SettingsFormData {
  general?: Partial<GeneralSettings>;
  notifications?: Partial<NotificationSettings>;
  privacy?: Partial<PrivacySettings>;
}