/**
 * Firestore Client - Infrastructure Layer
 *
 * Domain-Driven Design: Infrastructure implementation of Firestore client
 * Singleton pattern for managing Firestore instance
 *
 * IMPORTANT: This package requires Firebase App to be initialized first.
 * Use @umituz/react-native-firebase to initialize Firebase App.
 *
 * SOLID Principles:
 * - Single Responsibility: Only manages Firestore initialization
 * - Open/Closed: Extensible through configuration, closed for modification
 * - Dependency Inversion: Depends on Firebase App from @umituz/react-native-firebase
 */

import type { Firestore } from 'firebase/firestore';
import type { FirebaseApp } from 'firebase/app';
import { getFirebaseApp } from '@umituz/react-native-firebase';
import { FirebaseFirestoreInitializationError } from '../../domain/errors/FirebaseFirestoreError';
import { FirebaseFirestoreInitializer } from './initializers/FirebaseFirestoreInitializer';

/**
 * Firestore Client Singleton
 * Manages Firestore initialization
 */
class FirestoreClientSingleton {
  private static instance: FirestoreClientSingleton | null = null;
  private firestore: Firestore | null = null;
  private initializationError: string | null = null;

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  /**
   * Get singleton instance
   */
  static getInstance(): FirestoreClientSingleton {
    if (!FirestoreClientSingleton.instance) {
      FirestoreClientSingleton.instance = new FirestoreClientSingleton();
    }
    return FirestoreClientSingleton.instance;
  }

  /**
   * Initialize Firestore
   * Requires Firebase App to be initialized first via @umituz/react-native-firebase
   *
   * @returns Firestore instance or null if initialization fails
   */
  initialize(): Firestore | null {
    if (this.firestore) {
      return this.firestore;
    }
    if (this.initializationError) {
      return null;
    }
    try {
      const app = getFirebaseApp(); // Get the core Firebase App
      
      // Return null if Firebase App is not available (offline mode)
      if (!app) {
        return null;
      }
      
      this.firestore = FirebaseFirestoreInitializer.initialize(app);
      return this.firestore;
    } catch (error) {
      this.initializationError =
        error instanceof Error
          ? error.message
          : 'Failed to initialize Firestore client';
      return null;
    }
  }

  /**
   * Get Firestore instance
   * Auto-initializes if Firebase App is available
   * Returns null if config is not available (offline mode - no error)
   * @returns Firestore instance or null if not initialized
   */
  getFirestore(): Firestore | null {
    // Auto-initialize if not already initialized
    if (!this.firestore && !this.initializationError) {
      try {
        // Try to get Firebase App (will auto-initialize if config is available)
        const app = getFirebaseApp();
        if (app) {
          this.initialize();
        }
      } catch {
        // Firebase App not available, return null (offline mode)
        return null;
      }
    }

    // Return null if not initialized (offline mode - no error)
    return this.firestore || null;
  }

  /**
   * Check if Firestore is initialized
   */
  isInitialized(): boolean {
    return this.firestore !== null;
  }

  /**
   * Get initialization error if any
   */
  getInitializationError(): string | null {
    return this.initializationError;
  }

  /**
   * Reset Firestore client instance
   * Useful for testing
   */
  reset(): void {
    this.firestore = null;
    this.initializationError = null;
  }
}

export const firestoreClient = FirestoreClientSingleton.getInstance();

/**
 * Initialize Firestore
 * Requires Firebase App to be initialized first via @umituz/react-native-firebase
 *
 * @returns Firestore instance or null if initialization fails
 *
 * @example
 * ```typescript
 * import { initializeFirebase } from '@umituz/react-native-firebase';
 * import { initializeFirestore } from '@umituz/react-native-firestore';
 *
 * // Initialize Firebase App first
 * const app = initializeFirebase(config);
 *
 * // Then initialize Firestore
 * const db = initializeFirestore();
 * ```
 */
export function initializeFirestore(): Firestore | null {
  return firestoreClient.initialize();
}

/**
 * Get Firestore instance
 * Auto-initializes if Firebase App is available
 * Returns null if config is not available (offline mode - no error)
 * @returns Firestore instance or null if not initialized
 */
export function getFirestore(): Firestore | null {
  return firestoreClient.getFirestore();
}

/**
 * Check if Firestore is initialized
 */
export function isFirestoreInitialized(): boolean {
  return firestoreClient.isInitialized();
}

/**
 * Get Firestore initialization error if any
 */
export function getFirestoreInitializationError(): string | null {
  return firestoreClient.getInitializationError();
}

/**
 * Reset Firestore client instance
 * Useful for testing
 */
export function resetFirestoreClient(): void {
  firestoreClient.reset();
}

export type { Firestore } from 'firebase/firestore';

