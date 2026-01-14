
// Application constants - Version minimaliste
export const APP_CONFIG = {
  NAME: 'Pryzen Game',
  TAGLINE: 'Play. Bet. Win Crypto.',
  DESCRIPTION: 'Crypto multiplayer games & on-chain betting',
  VERSION: '1.0.0',
} as const;

export const API_ENDPOINTS = {
  SUPABASE_URL: 'https://ipmhknkldybzfmnwcgav.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwbWhrbmtsZHliemZtbndjZ2F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MTM3MTQsImV4cCI6MjA2MDI4OTcxNH0.TKvlskdaO_XpvhkPdgJ2-wijWebdaqKsSpma29BebHU',
} as const;

export const GAME_TYPES = {
  CLASSIC: 'classic',
  SPORT: 'sport',
} as const;

export const SESSION_STATUS = {
  WAITING: 'Waiting',
  ACTIVE: 'Active',
  FINISHED: 'Finished',
} as const;

export const CURRENCY = {
  USD: 'USD',
  XAF: 'XAF',
  STX: 'STX',
} as const;

export const MOBILE_PROVIDERS = {
  ORANGE: 'orange',
  MTN: 'mtn', 
  WAVE: 'wave',
  MPESA: 'mpesa',
  AIRTEL: 'airtel',
} as const;

export const VALIDATION_RULES = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_USERNAME_LENGTH: 20,
  MIN_USERNAME_LENGTH: 3,
  MAX_BIO_LENGTH: 500,
} as const;

export const DEFAULT_PAGINATION = {
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
