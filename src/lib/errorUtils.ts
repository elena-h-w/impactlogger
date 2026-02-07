/**
 * Error sanitization utilities for security.
 * 
 * These utilities prevent information disclosure by showing generic error
 * messages to users while logging detailed errors for debugging.
 * 
 * Security principle: Never expose internal database structure, table names,
 * column names, or query details to end users.
 */

/**
 * Sanitize database/API errors to prevent information disclosure.
 * 
 * This function:
 * 1. Logs the full error to console for development debugging
 * 2. Returns a generic, user-friendly message that doesn't reveal internals
 * 
 * @param error - The original error from database or API
 * @param context - Optional context for the log (e.g., "saving impact entry")
 * @returns A generic error message safe to display to users
 */
export function sanitizeError(error: unknown, context?: string): string {
  // Log full error details for debugging (only visible in dev tools)
  if (context) {
    console.error(`[${context}]`, error);
  } else {
    console.error('[Database operation]', error);
  }
  
  // Return generic message - never expose error.message to users
  return 'Unable to complete this operation. Please try again.';
}

/**
 * Generic error messages for common operations.
 * Using these ensures consistent, safe messaging across the app.
 */
export const ErrorMessages = {
  SAVE_FAILED: 'Unable to save. Please try again.',
  UPDATE_FAILED: 'Unable to update. Please try again.',
  DELETE_FAILED: 'Unable to delete. Please try again.',
  LOAD_FAILED: 'Unable to load data. Please refresh the page.',
  AUTH_FAILED: 'Authentication failed. Please try again.',
  GENERIC: 'Something went wrong. Please try again.',
} as const;
