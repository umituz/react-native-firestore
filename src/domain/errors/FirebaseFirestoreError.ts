/**
 * Firebase Firestore Domain Errors
 *
 * Domain-Driven Design: Error types for Firestore operations
 */

import { FirebaseError } from '@umituz/react-native-firebase';

/**
 * Firestore Error
 * Thrown when Firestore operations fail
 */
export class FirebaseFirestoreError extends FirebaseError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'FIRESTORE_ERROR', originalError);
    this.name = 'FirebaseFirestoreError';
    Object.setPrototypeOf(this, FirebaseFirestoreError.prototype);
  }
}

/**
 * Firestore Initialization Error
 * Thrown when Firestore fails to initialize
 */
export class FirebaseFirestoreInitializationError extends FirebaseFirestoreError {
  constructor(message: string, originalError?: unknown) {
    super(message, originalError);
    this.name = 'FirebaseFirestoreInitializationError';
    Object.setPrototypeOf(this, FirebaseFirestoreInitializationError.prototype);
  }
}

/**
 * Firestore Quota Error
 * Thrown when Firebase quota limits are exceeded
 *
 * Firebase quota limits:
 * - Free tier: 50K reads/day, 20K writes/day, 20K deletes/day
 * - Blaze plan: Pay as you go, higher limits
 *
 * This error is NOT retryable - quota won't increase by retrying
 */
export class FirebaseFirestoreQuotaError extends FirebaseFirestoreError {
  constructor(message: string, originalError?: unknown) {
    super(message, originalError);
    this.name = 'FirebaseFirestoreQuotaError';
    (this as any).isQuotaError = true;
    (this as any).code = 'resource-exhausted';
    Object.setPrototypeOf(this, FirebaseFirestoreQuotaError.prototype);
  }
}

