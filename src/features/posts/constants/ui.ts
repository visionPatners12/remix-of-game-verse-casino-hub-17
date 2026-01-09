// UI Constants

export const UI_SIZES = {
  HEADER_HEIGHT: 60,
  SIDEBAR_WIDTH: 320,
  MAX_CONTENT_WIDTH: 768,
  MOBILE_BREAKPOINT: 768,
} as const;

export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

export const Z_INDEX = {
  HEADER: 10,
  MODAL: 50,
  TOAST: 100,
} as const;

export const TEXTAREA_CONFIG = {
  MIN_ROWS: 3,
  MAX_ROWS: 8,
  PLACEHOLDER_ROTATION_INTERVAL: 3000,
} as const;

export const MEDIA_PREVIEW = {
  IMAGE_SIZE: 120,
  VIDEO_SIZE: 160,
  THUMBNAIL_QUALITY: 0.8,
} as const;

export const HASHTAG_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(var(--muted))',
] as const;

export const CONFIDENCE_COLORS = {
  LOW: 'hsl(var(--destructive))',
  MEDIUM: 'hsl(var(--warning))',
  HIGH: 'hsl(var(--success))',
} as const;

export const LOADING_STATES = {
  SUBMITTING: 'Publication en cours...',
  UPLOADING: 'Téléchargement en cours...',
  VALIDATING: 'Validation...',
} as const;