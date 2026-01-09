// Auth feature types - centralized type definitions

export interface UserMetadata {
  username?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  country?: string;
  date_of_birth?: string;
  auth_method?: 'email' | 'wallet' | 'privy';
  privy_user_id?: string;
  wallet_address?: string;
  avatar_url?: string;
}

export interface AppMetadata {
  provider?: string;
  providers?: string[];
  role?: string;
  [key: string]: string | string[] | undefined;
}

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: UserMetadata;
  app_metadata?: AppMetadata;
}

export interface AuthSession {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
  expires_at?: number;
}

export interface SignUpData {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  phone?: string;
  country: string;
  dateOfBirth?: Date;
  phoneVerified?: boolean;
}

export interface SignInData {
  email: string;
  password: string;
}

export type UserType = 'supabase' | 'privy' | 'none';

export interface AuthContextType {
  // Core auth state
  user: AuthUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // User type information
  userType: UserType;
  isEmailPasswordUser: boolean;
  isWalletUser: boolean;
  isFullyAuthenticated: boolean;
  
  // Auth actions
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (data: SignInData) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export interface AuthError {
  message: string;
  code?: string;
  weak_password?: {
    reasons: string[];
  };
}

export interface LoginError extends Error {
  name: 'LoginError';
  message: string;
  code?: string;
}

// Session validation helper
export function isValidSession(session: any): session is AuthSession {
  return session && 
         session.user && 
         typeof session.user.id === 'string' && 
         session.access_token;
}