/**
 * React Native Firestore - Public API
 *
 * Domain-Driven Design (DDD) Architecture
 *
 * This is the SINGLE SOURCE OF TRUTH for all Firestore operations.
 * ALL imports from the Firestore package MUST go through this file.
 *
 * Architecture:
 * - infrastructure: BaseRepository, utilities
 * - utils: Date utilities, timestamp conversion
 *
 * This package is designed to be used across hundreds of apps.
 * It provides a consistent interface for Firestore operations.
 *
 * Usage:
 *   import { BaseRepository, isoToTimestamp, timestampToISO } from '@umituz/react-native-firestore';
 */

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

// Re-export Firestore types for convenience
export type { Firestore, Timestamp } from 'firebase/firestore';

