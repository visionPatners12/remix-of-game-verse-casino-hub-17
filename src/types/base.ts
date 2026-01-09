// Base interfaces for consistent type definitions across the application

import { ReactNode, ComponentType } from 'react';

// ===== CORE BASE INTERFACES =====

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}

export interface BaseProps {
  className?: string;
  children?: ReactNode;
}

export interface BaseComponentProps extends BaseProps {
  variant?: 'default' | 'primary' | 'secondary' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
}

// ===== FORM BASE PATTERNS =====

export interface BaseFormData {
  [key: string]: string | number | boolean | Date | undefined | null;
}

export interface BaseFormProps<T extends BaseFormData> extends BaseProps {
  initialData?: Partial<T>;
  onSubmit: (data: T) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

// ===== LIST/CARD BASE PATTERNS =====

export interface BaseCardProps<T> extends BaseComponentProps {
  item: T;
  onClick?: (item: T) => void;
}

export interface BaseListProps<T> extends BaseComponentProps {
  items: T[];
  onItemClick?: (item: T) => void;
  emptyMessage?: string;
  viewMode?: 'grid' | 'list' | 'horizontal';
}

// ===== MODAL BASE PATTERNS =====

export interface BaseModalProps extends BaseProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

// ===== ASYNC STATE PATTERNS =====

export interface BaseAsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  isError: boolean;
  isSuccess: boolean;
}

// ===== USER/PROFILE BASE PATTERNS =====

export interface BaseUserData extends BaseEntity {
  privy_id?: string | null; // New: Privy DID for identification
  email: string;
  username: string;
  avatar_url?: string | null;
}

export interface BaseProfileData extends BaseUserData {
  first_name: string;
  last_name: string;
  phone: string;
  country: string;
  bio?: string;
  date_of_birth?: string;
  onboarding_completed?: boolean;
  is_profile_public?: boolean;
}

// ===== WALLET/TRANSACTION BASE PATTERNS =====

export interface BaseWalletData extends BaseEntity {
  user_id: string;
  balance: number;
  currency: string;
}

export interface BaseTransactionData extends BaseEntity {
  wallet_id: string;
  amount: number;
  type: string;
  status: 'pending' | 'completed' | 'failed';
  description?: string;
}

// ===== OPTION/SELECT BASE PATTERNS =====

export interface BaseOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface BaseSelectOption extends BaseOption {
  icon?: ComponentType;
  badge?: number | string;
}

export interface BaseCountryOption extends BaseOption {
  flag: string;
  dialCode: string;
}

// ===== NAVIGATION BASE PATTERNS =====

export interface BaseNavItem {
  label: string;
  href: string;
  icon?: ComponentType;
  badge?: number | string;
  disabled?: boolean;
}

// ===== SPORT/MATCH BASE PATTERNS =====

export interface BaseMatchData extends BaseEntity {
  team_a: string;
  team_b: string;
  status: string;
  description?: string;
}

export interface BaseTeamData {
  name: string;
  slug: string;
  image?: string;
  image_path?: string;
}

// ===== COMMON STATE PATTERNS =====

export interface BaseModalState {
  isOpen: boolean;
  data: any;
  step: number;
  isLoading: boolean;
}

export interface BaseFormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
}

// ===== UNIFIED COMPONENT PROPS =====

export interface BaseUnifiedButtonProps extends BaseComponentProps {
  buttonType?: 'default' | 'odds' | 'mobileOdds' | 'submit' | 'action';
  animationDirection?: 'up' | 'down' | 'none';
  label?: string;
  sublabel?: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface BaseUnifiedModalProps extends BaseModalProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: string;
    isLoading?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: string;
  };
}

export interface BaseUnifiedCardProps<T> extends BaseCardProps<T> {
  cardType?: 'default' | 'match' | 'list' | 'horizontal' | 'grid' | 'compact';
  image?: string;
  imageAlt?: string;
  subtitle?: string;
  footerContent?: React.ReactNode;
  contentAlignment?: 'left' | 'center' | 'right';
}

// ===== API PATTERNS =====

export interface BaseApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface BaseApiError {
  message: string;
  code?: string;
  field?: string;
}

// ===== PAGINATION PATTERNS =====

export interface BasePaginationData {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface BasePaginatedResponse<T> extends BaseApiResponse<T[]> {
  pagination: BasePaginationData;
}