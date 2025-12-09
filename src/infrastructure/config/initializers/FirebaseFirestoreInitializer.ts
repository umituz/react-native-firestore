/**
 * Firebase Firestore Initializer
 *
 * Single Responsibility: Initialize Firestore instance
 */

import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
} from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import type { FirebaseApp } from 'firebase/app';

/**
 * Initializes Firestore
 * Platform-agnostic: Works on all platforms (Web, iOS, Android)
 */
export class FirebaseFirestoreInitializer {
  /**
   * Initialize Firestore with persistent cache configuration
   */
  static initialize(app: FirebaseApp): Firestore {
    try {
      // Try to initialize with persistent cache (works on all platforms)
      return initializeFirestore(app, {
        localCache: persistentLocalCache(),
      });
    } catch (error: any) {
      // If already initialized or cache fails, get existing instance
      if (error.code === 'failed-precondition') {
        /* eslint-disable-next-line no-console */
        if (__DEV__)
          console.warn(
            'Firestore already initialized, using existing instance'
          );
        return getFirestore(app);
      }

      /* eslint-disable-next-line no-console */
      if (__DEV__) console.warn('Firestore initialization error:', error);
      return getFirestore(app);
    }
  }
}

