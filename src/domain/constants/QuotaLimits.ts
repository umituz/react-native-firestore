/**
 * Quota Limit Constants
 * Domain layer - Default Firestore quota limits
 *
 * General-purpose constants for any app using Firestore
 * Based on Firestore free tier and pricing documentation
 */

/**
 * Firestore free tier daily limits
 * https://firebase.google.com/docs/firestore/quotas
 */
export const FREE_TIER_LIMITS = {
  /**
   * Daily read operations (documents)
   * Free tier: 50,000 reads/day
   */
  DAILY_READS: 50_000,

  /**
   * Daily write operations (documents)
   * Free tier: 20,000 writes/day
   */
  DAILY_WRITES: 20_000,

  /**
   * Daily delete operations (documents)
   * Free tier: 20,000 deletes/day
   */
  DAILY_DELETES: 20_000,

  /**
   * Stored data (GB)
   * Free tier: 1 GB
   */
  STORAGE_GB: 1,
} as const;

/**
 * Quota warning thresholds (percentage of limit)
 * Apps can use these to show warnings before hitting limits
 */
export const QUOTA_THRESHOLDS = {
  /**
   * Warning threshold (80% of limit)
   * Show warning to user
   */
  WARNING: 0.8,

  /**
   * Critical threshold (95% of limit)
   * Show critical alert, consider disabling features
   */
  CRITICAL: 0.95,

  /**
   * Emergency threshold (98% of limit)
   * Disable non-essential features
   */
  EMERGENCY: 0.98,
} as const;

/**
 * Calculate quota usage percentage
 * @param current - Current usage count
 * @param limit - Total limit
 * @returns Percentage (0-1)
 */
export function calculateQuotaUsage(current: number, limit: number): number {
  return Math.min(1, current / limit);
}

/**
 * Check if quota threshold is reached
 * @param current - Current usage count
 * @param limit - Total limit
 * @param threshold - Threshold to check (0-1)
 * @returns true if threshold is reached
 */
export function isQuotaThresholdReached(
  current: number,
  limit: number,
  threshold: number,
): boolean {
  const usage = calculateQuotaUsage(current, limit);
  return usage >= threshold;
}

/**
 * Get remaining quota
 * @param current - Current usage count
 * @param limit - Total limit
 * @returns Remaining quota count
 */
export function getRemainingQuota(current: number, limit: number): number {
  return Math.max(0, limit - current);
}
