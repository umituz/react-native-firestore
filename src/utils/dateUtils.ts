/**
 * Date Utilities for Firestore
 *
 * Provides utilities for converting between ISO strings and Firestore Timestamps.
 * These utilities are app-agnostic and can be used across hundreds of apps.
 */

import type { Timestamp } from "firebase/firestore";

/**
 * Convert ISO string to Firestore Timestamp
 *
 * @param isoString - ISO date string
 * @returns Firestore Timestamp or null if invalid
 *
 * @example
 * ```typescript
 * const timestamp = isoToTimestamp("2024-01-01T00:00:00.000Z");
 * ```
 */
export function isoToTimestamp(isoString: string | null | undefined): Timestamp | null {
  if (!isoString) {
    return null;
  }

  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return null;
    }

    // Import Timestamp dynamically to avoid issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Timestamp: FirestoreTimestamp } = require("firebase/firestore");
    return FirestoreTimestamp.fromDate(date);
  } catch {
    return null;
  }
}

/**
 * Convert Firestore Timestamp to ISO string
 *
 * @param timestamp - Firestore Timestamp, Date, or ISO string
 * @returns ISO date string or null if invalid
 *
 * @example
 * ```typescript
 * const isoString = timestampToISO(timestamp);
 * ```
 */
export function timestampToISO(
  timestamp: Timestamp | Date | string | null | undefined,
): string | null {
  if (!timestamp) {
    return null;
  }

  try {
    if (timestamp instanceof Date) {
      return timestamp.toISOString();
    }

    if (typeof timestamp === "string") {
      // Already an ISO string, validate it
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return null;
      }
      return timestamp;
    }

    // Firestore Timestamp
    if (timestamp && typeof timestamp === "object" && "toDate" in timestamp) {
      const date = (timestamp as Timestamp).toDate();
      return date.toISOString();
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Convert Firestore Timestamp to Date
 *
 * @param timestamp - Firestore Timestamp, Date, or ISO string
 * @returns Date object or null if invalid
 *
 * @example
 * ```typescript
 * const date = timestampToDate(timestamp);
 * ```
 */
export function timestampToDate(
  timestamp: Timestamp | Date | string | null | undefined,
): Date | null {
  if (!timestamp) {
    return null;
  }

  try {
    if (timestamp instanceof Date) {
      return timestamp;
    }

    if (typeof timestamp === "string") {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return null;
      }
      return date;
    }

    // Firestore Timestamp
    if (timestamp && typeof timestamp === "object" && "toDate" in timestamp) {
      return (timestamp as Timestamp).toDate();
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Get current ISO string
 *
 * @returns Current date as ISO string
 *
 * @example
 * ```typescript
 * const now = getCurrentISOString();
 * ```
 */
export function getCurrentISOString(): string {
  return new Date().toISOString();
}

