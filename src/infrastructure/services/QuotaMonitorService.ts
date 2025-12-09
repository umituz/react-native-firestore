/**
 * Quota Monitor Service
 * Infrastructure service for monitoring Firestore quota usage
 */

import type { QuotaMetrics, QuotaLimits, QuotaStatus } from '../../domain/entities/QuotaMetrics';
import { QuotaCalculator } from '../../domain/services/QuotaCalculator';

export class QuotaMonitorService {
  private metrics: QuotaMetrics = {
    readCount: 0,
    writeCount: 0,
    deleteCount: 0,
    timestamp: Date.now(),
  };

  private limits: QuotaLimits = QuotaCalculator.getDefaultLimits();
  private listeners: Set<(status: QuotaStatus) => void> = new Set();

  /**
   * Set quota limits
   */
  setLimits(limits: Partial<QuotaLimits>): void {
    this.limits = { ...this.limits, ...limits };
  }

  /**
   * Increment read count
   */
  incrementRead(count: number = 1): void {
    this.metrics.readCount += count;
    this.notifyListeners();
  }

  /**
   * Increment write count
   */
  incrementWrite(count: number = 1): void {
    this.metrics.writeCount += count;
    this.notifyListeners();
  }

  /**
   * Increment delete count
   */
  incrementDelete(count: number = 1): void {
    this.metrics.deleteCount += count;
    this.notifyListeners();
  }

  /**
   * Get current metrics
   */
  getMetrics(): QuotaMetrics {
    return { ...this.metrics };
  }

  /**
   * Get current status
   */
  getStatus(): QuotaStatus {
    return QuotaCalculator.calculateStatus(this.metrics, this.limits);
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      readCount: 0,
      writeCount: 0,
      deleteCount: 0,
      timestamp: Date.now(),
    };
    this.notifyListeners();
  }

  /**
   * Add status change listener
   */
  addListener(listener: (status: QuotaStatus) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    const status = this.getStatus();
    this.listeners.forEach((listener) => {
      try {
        listener(status);
      } catch (error) {
        /* eslint-disable-next-line no-console */
        if (__DEV__) {
          /* eslint-disable-next-line no-console */
          console.error('[QuotaMonitor] Listener error:', error);
        }
      }
    });
  }
}

export const quotaMonitorService = new QuotaMonitorService();

