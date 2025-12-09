/**
 * Quota Error Detector Utility
 * Single Responsibility: Detect Firebase quota errors
 *
 * Firebase quota limits:
 * - Free tier: 50K reads/day, 20K writes/day, 20K deletes/day
 * - Blaze plan: Pay as you go, higher limits
 *
 * Quota errors are NOT retryable - quota won't increase by retrying
 */

/**
 * Check if error is a Firebase quota error
 * Quota errors indicate daily read/write/delete limits are exceeded
 *
 * @param error - Error object to check
 * @returns true if error is a quota error
 */
export function isQuotaError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const firebaseError = error as { code?: string; message?: string; name?: string };

  // Check error code
  if (firebaseError.code === "resource-exhausted") {
    return true;
  }

  // Check error message
  const errorMessage = firebaseError.message?.toLowerCase() || "";
  if (
    errorMessage.includes("quota") ||
    errorMessage.includes("quota exceeded") ||
    errorMessage.includes("resource-exhausted") ||
    errorMessage.includes("daily limit")
  ) {
    return true;
  }

  // Check error name
  const errorName = firebaseError.name?.toLowerCase() || "";
  if (errorName.includes("quota") || errorName.includes("resource-exhausted")) {
    return true;
  }

  return false;
}

/**
 * Check if error is retryable
 * Quota errors are NOT retryable
 *
 * @param error - Error object to check
 * @returns true if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  // Quota errors are NOT retryable
  if (isQuotaError(error)) {
    return false;
  }

  if (!error || typeof error !== "object") {
    return false;
  }

  const firebaseError = error as { code?: string; message?: string };

  // Firestore transaction conflicts are retryable
  if (firebaseError.code === "failed-precondition") {
    return true;
  }

  // Network errors are retryable
  if (
    firebaseError.code === "unavailable" ||
    firebaseError.code === "deadline-exceeded"
  ) {
    return true;
  }

  // Timeout errors are retryable
  const errorMessage = firebaseError.message?.toLowerCase() || "";
  if (errorMessage.includes("timeout")) {
    return true;
  }

  return false;
}

/**
 * Get user-friendly quota error message
 *
 * @returns User-friendly error message
 */
export function getQuotaErrorMessage(): string {
  return "Firebase quota exceeded. Please try again later or upgrade your Firebase plan.";
}

