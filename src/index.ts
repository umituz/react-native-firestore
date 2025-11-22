/**
 * React Native Firestore - Public API
 *
 * Domain-Driven Design (DDD) Architecture
 *
 * This is the SINGLE SOURCE OF TRUTH for all Firestore operations.
 * ALL imports from the Firestore package MUST go through this file.
 *
 * Architecture:
 * - domain: Errors
 * - infrastructure: Firestore client, BaseRepository, utilities
 * - utils: Date utilities, timestamp conversion
 *
 * This package is designed to be used across hundreds of apps.
 * It provides a consistent interface for Firestore operations.
 *
 * Usage:
 *   import { initializeFirestore, getFirestore, BaseRepository } from '@umituz/react-native-firestore';
 */

// =============================================================================
// DOMAIN LAYER - Errors
// =============================================================================

export {
  FirebaseFirestoreError,
  FirebaseFirestoreInitializationError,
  FirebaseFirestoreQuotaError,
} from './domain/errors/FirebaseFirestoreError';

// =============================================================================
// INFRASTRUCTURE LAYER - Firestore Client
// =============================================================================

export {
  initializeFirestore,
  getFirestore,
  isFirestoreInitialized,
  getFirestoreInitializationError,
  resetFirestoreClient,
  firestoreClient,
} from './infrastructure/config/FirestoreClient';

export type { Firestore } from './infrastructure/config/FirestoreClient';

// =============================================================================
// INFRASTRUCTURE LAYER - BaseRepository
// =============================================================================

export { BaseRepository } from './infrastructure/repositories/BaseRepository';

// =============================================================================
// UTILS - Date Utilities
// =============================================================================

export {
  isoToTimestamp,
  timestampToISO,
  timestampToDate,
  getCurrentISOString,
} from './utils/dateUtils';

// =============================================================================
// UTILS - Query Builder
// =============================================================================

export {
  buildQuery,
  createInFilter,
  createEqualFilter,
} from './utils/query-builder';

export type {
  QueryBuilderOptions,
  FieldFilter,
} from './utils/query-builder';

// =============================================================================
// UTILS - Quota Error Detection
// =============================================================================

export {
  isQuotaError,
  isRetryableError,
  getQuotaErrorMessage,
} from './utils/quota-error-detector.util';

// Re-export Firestore types for convenience
export type { Timestamp } from 'firebase/firestore';

