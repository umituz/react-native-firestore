/**
 * Quota Tracking Middleware
 * Tracks Firestore operations for quota monitoring
 */

import { quotaMonitorService } from '../services/QuotaMonitorService';
import { requestLoggerService } from '../services/RequestLoggerService';
import type { RequestType } from '../../domain/entities/RequestLog';

interface TrackedOperation {
  type: RequestType;
  collection: string;
  documentId?: string;
  count: number;
  cached?: boolean;
}

export class QuotaTrackingMiddleware {
  /**
   * Track a read operation
   */
  trackRead(collection: string, count: number = 1, cached: boolean = false): void {
    quotaMonitorService.incrementRead(count);
    requestLoggerService.logRequest({
      type: 'read',
      collection,
      success: true,
      cached,
    });
  }

  /**
   * Track a write operation
   */
  trackWrite(
    collection: string,
    documentId?: string,
    count: number = 1,
  ): void {
    quotaMonitorService.incrementWrite(count);
    requestLoggerService.logRequest({
      type: 'write',
      collection,
      documentId,
      success: true,
      cached: false,
    });
  }

  /**
   * Track a delete operation
   */
  trackDelete(
    collection: string,
    documentId?: string,
    count: number = 1,
  ): void {
    quotaMonitorService.incrementDelete(count);
    requestLoggerService.logRequest({
      type: 'delete',
      collection,
      documentId,
      success: true,
      cached: false,
    });
  }

  /**
   * Track a listener operation
   */
  trackListener(collection: string, documentId?: string): void {
    requestLoggerService.logRequest({
      type: 'listener',
      collection,
      documentId,
      success: true,
      cached: false,
    });
  }

  /**
   * Track a failed operation
   */
  trackError(
    type: RequestType,
    collection: string,
    error: string,
    documentId?: string,
  ): void {
    requestLoggerService.logRequest({
      type,
      collection,
      documentId,
      success: false,
      error,
      cached: false,
    });
  }

  /**
   * Track operation with timing
   */
  async trackOperation<T>(
    operation: TrackedOperation,
    operationFn: () => Promise<T>,
  ): Promise<T> {
    const startTime = Date.now();

    try {
      const result = await operationFn();
      const duration = Date.now() - startTime;

      if (operation.type === 'read') {
        quotaMonitorService.incrementRead(operation.count);
        requestLoggerService.logRequest({
          type: 'read',
          collection: operation.collection,
          documentId: operation.documentId,
          success: true,
          cached: operation.cached || false,
          duration,
        });
      } else if (operation.type === 'write') {
        quotaMonitorService.incrementWrite(operation.count);
        requestLoggerService.logRequest({
          type: 'write',
          collection: operation.collection,
          documentId: operation.documentId,
          success: true,
          cached: false,
          duration,
        });
      } else if (operation.type === 'delete') {
        quotaMonitorService.incrementDelete(operation.count);
        requestLoggerService.logRequest({
          type: 'delete',
          collection: operation.collection,
          documentId: operation.documentId,
          success: true,
          cached: false,
          duration,
        });
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      requestLoggerService.logRequest({
        type: operation.type,
        collection: operation.collection,
        documentId: operation.documentId,
        success: false,
        error: errorMessage,
        cached: false,
        duration,
      });

      throw error;
    }
  }
}

export const quotaTrackingMiddleware = new QuotaTrackingMiddleware();

