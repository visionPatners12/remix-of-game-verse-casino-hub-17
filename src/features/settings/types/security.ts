// Security settings types
export interface SecuritySettings {
  pinEnabled: boolean;
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  sessionTimeout: number; // in minutes
  loginAlerts: boolean;
}

export interface PinStatus {
  hasPin: boolean;
  isEnabled: boolean;
  lastUsedAt: string | null;
  failedAttempts: number;
  isLocked: boolean;
  lockExpiresAt: string | null;
}

export interface SecurityFormData {
  currentPin?: string;
  newPin?: string;
  confirmPin?: string;
  settings?: Partial<SecuritySettings>;
}

export type PinMode = 'create' | 'change' | 'verify' | 'disable';
export type SecurityAction = 'payment' | 'settings' | 'withdrawal' | 'account';