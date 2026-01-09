// SMS Verification Types for Prelude API

export type DevicePlatform = 'android' | 'ios' | 'ipados' | 'tvos' | 'web';

export type VerificationStatus = 'success' | 'retry' | 'blocked';

export type VerificationMethod = 'email' | 'message' | 'silent' | 'voice';

export type BlockReason = 
  | 'expired_signature'
  | 'in_block_list'
  | 'invalid_phone_line'
  | 'invalid_phone_number'
  | 'invalid_signature'
  | 'repeated_attempts'
  | 'suspicious';

export type VerificationChannel = 
  | 'rcs'
  | 'silent'
  | 'sms'
  | 'telegram'
  | 'viber'
  | 'voice'
  | 'whatsapp'
  | 'zalo';

export interface VerificationSignals {
  ip?: string;
  device_id?: string;
  device_platform?: DevicePlatform;
  device_model?: string;
  os_version?: string;
  app_version?: string;
  user_agent?: string;
  is_trusted_user?: boolean;
}

export interface VerificationTarget {
  type: 'phone_number' | 'email';
  value: string;
}

export interface VerificationSilent {
  request_url: string;
}

export interface VerificationMetadata {
  correlation_id?: string;
}

export interface SendVerificationRequest {
  action: 'send';
  phone: string;
  signals?: VerificationSignals;
  dispatch_id?: string;
  metadata?: VerificationMetadata;
}

export interface VerifyCodeRequest {
  action: 'verify';
  phone: string;
  code: string;
}

export interface VerificationResponse {
  success: boolean;
  message?: string;
  // Prelude API response fields
  id?: string;
  status?: VerificationStatus;
  method?: VerificationMethod;
  reason?: BlockReason;
  channels?: VerificationChannel[];
  silent?: VerificationSilent;
  metadata?: VerificationMetadata;
  request_id?: string;
  // Additional fields
  verification_id?: string;
  verified?: boolean;
  silent_request_url?: string;
  code?: string;
}

export interface DeviceInfo {
  ip?: string;
  device_id: string;
  device_platform: DevicePlatform;
  device_model?: string;
  os_version?: string;
  app_version: string;
  user_agent: string;
  is_trusted_user?: boolean;
}