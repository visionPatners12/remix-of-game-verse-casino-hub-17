// Validation Constants

export const VALIDATION_LIMITS = {
  CONTENT: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 2000,
  },
  HASHTAG: {
    MAX_COUNT: 10,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9_]+$/,
  },
  MEDIA: {
    MAX_COUNT: 5,
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'],
  },
  BET: {
    MIN_AMOUNT: 0.01,
    MAX_AMOUNT: 10000,
  },
  CONFIDENCE: {
    MIN_VALUE: 1,
    MAX_VALUE: 100,
  },
} as const;

export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  CONTENT: {
    EMPTY: 'Content cannot be empty',
    TOO_LONG: `Content cannot exceed ${VALIDATION_LIMITS.CONTENT.MAX_LENGTH} characters`,
  },
  PREDICTION: {
    REQUIRED: 'Please select a market for your prediction',
  },
  MATCH: {
    REQUIRED: 'Please select a match for your opinion',
  },
  HASHTAG: {
    EMPTY: 'Hashtag cannot be empty',
    TOO_LONG: `Hashtag cannot exceed ${VALIDATION_LIMITS.HASHTAG.MAX_LENGTH} characters`,
    INVALID_FORMAT: 'Hashtag can only contain letters, numbers and underscores',
    TOO_MANY: `You cannot add more than ${VALIDATION_LIMITS.HASHTAG.MAX_COUNT} hashtags`,
  },
  MEDIA: {
    TOO_MANY: `You cannot add more than ${VALIDATION_LIMITS.MEDIA.MAX_COUNT} media files`,
    FILE_TOO_LARGE: 'File is too large (max 10MB)',
    INVALID_TYPE: 'Unsupported file type',
  },
  BET: {
    INVALID_AMOUNT: 'Bet amount must be greater than 0',
    TOO_LARGE: `Amount cannot exceed ${VALIDATION_LIMITS.BET.MAX_AMOUNT}`,
  },
  CONFIDENCE: {
    OUT_OF_RANGE: `Confidence must be between ${VALIDATION_LIMITS.CONFIDENCE.MIN_VALUE} and ${VALIDATION_LIMITS.CONFIDENCE.MAX_VALUE}%`,
  },
} as const;