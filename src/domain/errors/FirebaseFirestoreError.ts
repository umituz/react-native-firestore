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

