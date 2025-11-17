/**
 * Base Repository
 *
 * Provides common Firestore operations with centralized database access.
 * All Firestore repositories should extend this class.
 *
 * Architecture:
 * - DRY: Centralized database access (getDb)
 * - SOLID: Single Responsibility - Database access only
 * - KISS: Simple base class with protected db property
 * - App-agnostic: Works with any app, no app-specific code
 *
 * This class is designed to be used across hundreds of apps.
 * It provides a consistent interface for Firestore operations.
 *
 * @example
 * ```typescript
 * import { BaseRepository } from '@umituz/react-native-firestore';
 *
 * export class MyRepository extends BaseRepository {
 *   async create(data: MyData): Promise<MyData> {
 *     const db = this.getDb();
 *     // Use db for Firestore operations
 *   }
 * }
 * ```
 */

import type { Firestore } from "firebase/firestore";
import { getFirestore } from "../config/FirestoreClient";

export class BaseRepository {
  /**
   * Get Firestore database instance
   * Throws error if Firestore is not initialized
   *
   * @returns Firestore instance
   * @throws Error if Firestore is not initialized
   */
  protected getDb(): Firestore {
    const db = getFirestore();
    if (!db) {
      throw new Error("Firestore is not initialized. Please call initializeFirebase() first.");
    }
    return db;
  }

  /**
   * Check if Firestore is initialized
   * Useful for conditional operations
   *
   * @returns true if Firestore is initialized, false otherwise
   */
  protected isDbInitialized(): boolean {
    try {
      const db = getFirestore();
      return db !== null;
    } catch {
      return false;
    }
  }
}

