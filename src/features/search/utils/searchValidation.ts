/**
 * Search validation utilities
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate search query
 */
export function validateSearchQuery(query: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Basic validation
  if (!query || typeof query !== 'string') {
    errors.push('Search query is required');
    return { isValid: false, errors, warnings };
  }
  
  const trimmedQuery = query.trim();
  
  if (trimmedQuery.length === 0) {
    errors.push('Search query cannot be empty');
  }
  
  if (trimmedQuery.length > 100) {
    errors.push('Search query is too long (maximum 100 characters)');
  }
  
  if (trimmedQuery.length < 2 && trimmedQuery.length > 0) {
    warnings.push('Search query is very short, results may be limited');
  }
  
  // Check for potentially harmful content
  const harmfulPatterns = [
    { pattern: /<script/i, message: 'Script tags are not allowed' },
    { pattern: /javascript:/i, message: 'JavaScript protocol is not allowed' },
    { pattern: /<.*onclick/i, message: 'Event handlers are not allowed' },
    { pattern: /sql.*drop/i, message: 'SQL injection attempts are not allowed' },
    { pattern: /union.*select/i, message: 'SQL injection attempts are not allowed' }
  ];
  
  harmfulPatterns.forEach(({ pattern, message }) => {
    if (pattern.test(query)) {
      errors.push(message);
    }
  });
  
  // Check for excessive special characters
  const specialCharCount = (query.match(/[!@#$%^&*(),.?":{}|<>]/g) || []).length;
  if (specialCharCount > query.length * 0.3) {
    warnings.push('Query contains many special characters, results may be limited');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate search filters
 */
export function validateSearchFilters(filters: Record<string, any>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validate date range
  if (filters.dateRange) {
    const validDateRanges = ['day', 'week', 'month', 'year', 'all'];
    if (!validDateRanges.includes(filters.dateRange)) {
      errors.push('Invalid date range filter');
    }
  }
  
  // Validate content type
  if (filters.type) {
    const validTypes = ['user', 'post', 'news', 'all'];
    if (!validTypes.includes(filters.type)) {
      errors.push('Invalid content type filter');
    }
  }
  
  // Validate sort option
  if (filters.sortBy) {
    const validSortOptions = ['relevance', 'recent', 'popular', 'followers'];
    if (!validSortOptions.includes(filters.sortBy)) {
      errors.push('Invalid sort option');
    }
  }
  
  // Validate minimum followers
  if (filters.minFollowers !== undefined) {
    if (typeof filters.minFollowers !== 'number' || filters.minFollowers < 0) {
      errors.push('Minimum followers must be a positive number');
    }
    if (filters.minFollowers > 1000000) {
      warnings.push('High minimum follower count may significantly limit results');
    }
  }
  
  // Validate location
  if (filters.location && typeof filters.location !== 'string') {
    errors.push('Location filter must be a string');
  }
  
  // Validate categories array
  if (filters.category) {
    if (!Array.isArray(filters.category)) {
      errors.push('Category filter must be an array');
    } else if (filters.category.length > 10) {
      warnings.push('Too many categories selected, consider reducing for better performance');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') {
    return '';
  }
  
  return query
    .trim()
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 100); // Limit length
}

/**
 * Check if query is likely spam
 */
export function isSpamQuery(query: string): boolean {
  const spamPatterns = [
    /(.)\1{10,}/, // Repeated characters
    /^[^a-zA-Z0-9\s]{5,}$/, // Only special characters
    /(buy|sell|cheap|free|win|click|here|now){3,}/i, // Spam words
    /\b(viagra|casino|poker|lottery|prize)\b/i // Common spam terms
  ];
  
  return spamPatterns.some(pattern => pattern.test(query));
}

/**
 * Suggest query improvements
 */
export function suggestQueryImprovements(query: string): string[] {
  const suggestions: string[] = [];
  
  if (!query || query.trim().length === 0) {
    return suggestions;
  }
  
  const trimmedQuery = query.trim();
  
  // Too short
  if (trimmedQuery.length === 1) {
    suggestions.push('Try typing at least 2 characters for better results');
  }
  
  // All uppercase
  if (trimmedQuery === trimmedQuery.toUpperCase() && trimmedQuery.length > 3) {
    suggestions.push('Try using normal capitalization for better matching');
  }
  
  // No spaces but long
  if (trimmedQuery.length > 15 && !trimmedQuery.includes(' ')) {
    suggestions.push('Try breaking long terms into separate words');
  }
  
  // Multiple consecutive spaces
  if (/\s{2,}/.test(query)) {
    suggestions.push('Remove extra spaces between words');
  }
  
  // Ends with incomplete word
  if (trimmedQuery.endsWith(' ')) {
    suggestions.push('Complete your search term or remove trailing spaces');
  }
  
  // Common typos in search context
  const typoReplacements = [
    { from: /serach/gi, to: 'search', suggestion: 'Did you mean "search"?' },
    { from: /usr/gi, to: 'user', suggestion: 'Did you mean "user"?' },
    { from: /profil/gi, to: 'profile', suggestion: 'Did you mean "profile"?' }
  ];
  
  typoReplacements.forEach(({ from, suggestion }) => {
    if (from.test(trimmedQuery)) {
      suggestions.push(suggestion);
    }
  });
  
  return suggestions;
}

/**
 * Rate limit validation with memory-optimized request history
 */
export function validateRateLimit(
  userId: string | null, 
  requestHistory: Map<string, number[]>,
  maxRequests: number = 60,
  timeWindow: number = 60000 // 1 minute
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const key = userId || 'anonymous';
  const now = Date.now();
  const userRequests = requestHistory.get(key) || [];
  
  // Remove old requests outside time window
  const recentRequests = userRequests.filter(timestamp => now - timestamp < timeWindow);
  requestHistory.set(key, recentRequests);
  
  // Limit requestHistory size to prevent memory growth
  if (requestHistory.size > 100) {
    const keysToDelete = Array.from(requestHistory.keys()).slice(0, requestHistory.size - 100);
    keysToDelete.forEach(k => requestHistory.delete(k));
  }
  
  if (recentRequests.length >= maxRequests) {
    errors.push('Too many search requests. Please wait before searching again.');
  } else if (recentRequests.length >= maxRequests * 0.8) {
    warnings.push('Approaching search rate limit');
  }
  
  // Add current request
  recentRequests.push(now);
  requestHistory.set(key, recentRequests);
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}