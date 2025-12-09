/**
 * Quota Metrics Entity
 * Domain entity for tracking Firestore quota usage
 */

export interface QuotaMetrics {
  readCount: number;
  writeCount: number;
  deleteCount: number;
  timestamp: number;
}

export interface QuotaLimits {
  dailyReadLimit: number;
  dailyWriteLimit: number;
  dailyDeleteLimit: number;
}

export interface QuotaStatus {
  metrics: QuotaMetrics;
  limits: QuotaLimits;
  readPercentage: number;
  writePercentage: number;
  deletePercentage: number;
  isNearLimit: boolean;
  isOverLimit: boolean;
}

