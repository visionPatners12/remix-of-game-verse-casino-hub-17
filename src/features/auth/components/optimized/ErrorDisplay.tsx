import React, { memo } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ValidationError } from '@/utils/signupValidation';

interface AuthError {
  code: string;
  message: string;
  isWeakPassword?: boolean;
}

interface ErrorDisplayProps {
  validationErrors: ValidationError[];
  authError: AuthError | null;
}

/**
 * Optimized error display component
 */
export const ErrorDisplay = memo(({ validationErrors, authError }: ErrorDisplayProps) => {
  const hasValidationErrors = validationErrors.length > 0;
  const hasAuthError = authError && !authError.isWeakPassword;

  if (!hasValidationErrors && !hasAuthError) {
    return null;
  }

  return (
    <>
      {/* Display validation errors */}
      {hasValidationErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc pl-4 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Display auth errors */}
      {hasAuthError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{authError.message}</AlertDescription>
        </Alert>
      )}
    </>
  );
});

ErrorDisplay.displayName = 'ErrorDisplay';