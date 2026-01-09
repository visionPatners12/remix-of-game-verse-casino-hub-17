/**
 * Utility functions for age calculations and validations
 */

export const MIN_AGE_REQUIREMENT = 18;

/**
 * Calculate precise age based on birth date
 * @param birthDate - Date of birth
 * @param referenceDate - Reference date (defaults to today)
 * @returns Precise age in years
 */
export const calculateAge = (birthDate: Date, referenceDate: Date = new Date()): number => {
  const today = new Date(referenceDate);
  const birth = new Date(birthDate);
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Check if age meets minimum requirement
 * @param birthDate - Date of birth
 * @param minAge - Minimum age requirement (defaults to MIN_AGE_REQUIREMENT)
 * @returns True if age is valid
 */
export const isValidAge = (birthDate: Date, minAge: number = MIN_AGE_REQUIREMENT): boolean => {
  const age = calculateAge(birthDate);
  return age >= minAge;
};

/**
 * Get age validation error message
 * @param birthDate - Date of birth
 * @param minAge - Minimum age requirement (defaults to MIN_AGE_REQUIREMENT)
 * @returns Error message if invalid, null if valid
 */
export const getAgeValidationError = (birthDate: Date, minAge: number = MIN_AGE_REQUIREMENT): string | null => {
  if (!isValidAge(birthDate, minAge)) {
    return `Vous devez avoir au moins ${minAge} ans`;
  }
  return null;
};

/**
 * Get the maximum birth year for a given minimum age
 * @param minAge - Minimum age requirement
 * @returns Maximum birth year
 */
export const getMaxBirthYear = (minAge: number = MIN_AGE_REQUIREMENT): number => {
  return new Date().getFullYear() - minAge;
};