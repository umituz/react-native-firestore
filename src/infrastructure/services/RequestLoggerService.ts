/**
 * Request Logger Service
 * Infrastructure service for logging Firestore requests
 */

import type { RequestLog, RequestStats, RequestType } from '../../domain/entities/RequestLog';

export class RequestLoggerService {
  private logs: RequestLog[] = [];
  private readonly MAX_LOGS = 1000;
  private listeners: Set<(log: RequestLog) => void> = new Set();

  /**
   * Log a request
   */
  logRequest(log: Omit<RequestLog, 'id' | 'timestamp'>): void {
    const fullLog: RequestLog = {
      ...log,
      id: this.generateId(),
      timestamp: Date.now(),
    };

    this.logs.push(fullLog);

    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }

    // Log Firestore operations in development mode
    if (__DEV__) {
      const prefix = fullLog.cached ? '[Firestore Cache]' : '[Firestore]';
      const operation = fullLog.type.toUpperCase();
      const status = fullLog.success ? '✓' : '✗';
      const details = fullLog.documentId
        ? `${fullLog.collection}/${fullLog.documentId}`
        : fullLog.collection;

      if (fullLog.success) {
        // eslint-disable-next-line no-console
        console.log(`${prefix} ${status} ${operation}: ${details}`);
      } else {
        // eslint-disable-next-line no-console
        console.error(`${prefix} ${status} ${operation}: ${details}`, fullLog.error);
      }
    }

    this.notifyListeners(fullLog);
  }

  /**
   * Get all logs
   */
  getLogs(): RequestLog[] {
    return [...this.logs];
  }

  /**
   * Get logs by type
   */
  getLogsByType(type: RequestType): RequestLog[] {
    return this.logs.filter((log) => log.type === type);
  }

  /**
   * Get request statistics
   */
  getStats(): RequestStats {
    const totalRequests = this.logs.length;
    const readRequests = this.logs.filter((l) => l.type === 'read').length;
    const writeRequests = this.logs.filter((l) => l.type === 'write').length;
    const deleteRequests = this.logs.filter((l) => l.type === 'delete').length;
    const listenerRequests = this.logs.filter((l) => l.type === 'listener').length;
    const cachedRequests = this.logs.filter((l) => l.cached).length;
    const failedRequests = this.logs.filter((l) => !l.success).length;

    const durations = this.logs
      .filter((l) => l.duration !== undefined)
      .map((l) => l.duration!);
    const averageDuration =
      durations.length > 0
        ? durations.reduce((sum, d) => sum + d, 0) / durations.length
        : 0;

    return {
      totalRequests,
      readRequests,
      writeRequests,
      deleteRequests,
      listenerRequests,
      cachedRequests,
      failedRequests,
      averageDuration,
    };
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Add log listener
   */
  addListener(listener: (log: RequestLog) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(log: RequestLog): void {
    this.listeners.forEach((listener) => {
      try {
        listener(log);
      } catch (error) {
        /* eslint-disable-next-line no-console */
        if (__DEV__) {
          /* eslint-disable-next-line no-console */
          console.error('[RequestLogger] Listener error:', error);
        }
      }
    });
  }
}

export const requestLoggerService = new RequestLoggerService();

