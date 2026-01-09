// ===== USER METADATA TYPES =====

/**
 * Extended user metadata from Supabase auth
 */
export interface UserMetadata {
  avatar_url?: string;
  username?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  [key: string]: unknown;
}

/**
 * Helper to safely get a string value from user metadata
 */
export function getMetadataString(
  metadata: UserMetadata | undefined | null, 
  key: keyof UserMetadata
): string | undefined {
  if (!metadata) return undefined;
  const value = metadata[key];
  return typeof value === 'string' ? value : undefined;
}
