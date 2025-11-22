/**
 * Query Deduplication Middleware
 * Prevents duplicate Firestore queries within a short time window
 */

interface PendingQuery {
  promise: Promise<unknown>;
  timestamp: number;
}

interface QueryKey {
  collection: string;
  filters: string;
  limit?: number;
  orderBy?: string;
}

export class QueryDeduplicationMiddleware {
  private pendingQueries = new Map<string, PendingQuery>();
  private readonly DEDUPLICATION_WINDOW_MS = 1000; // 1 second

  /**
   * Generate query key from query parameters
   */
  private generateQueryKey(key: QueryKey): string {
    const parts = [
      key.collection,
      key.filters,
      key.limit?.toString() || '',
      key.orderBy || '',
    ];
    return parts.join('|');
  }

  /**
   * Check if query is already pending
   */
  private isQueryPending(key: string): boolean {
    const pending = this.pendingQueries.get(key);
    if (!pending) return false;

    const age = Date.now() - pending.timestamp;
    if (age > this.DEDUPLICATION_WINDOW_MS) {
      this.pendingQueries.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Get pending query promise
   */
  private getPendingQuery(key: string): Promise<unknown> | null {
    const pending = this.pendingQueries.get(key);
    return pending ? pending.promise : null;
  }

  /**
   * Add query to pending list
   */
  private addPendingQuery(key: string, promise: Promise<unknown>): void {
    this.pendingQueries.set(key, {
      promise,
      timestamp: Date.now(),
    });

    promise.finally(() => {
      this.pendingQueries.delete(key);
    });
  }

  /**
   * Deduplicate a query
   */
  async deduplicate<T>(
    queryKey: QueryKey,
    queryFn: () => Promise<T>,
  ): Promise<T> {
    const key = this.generateQueryKey(queryKey);

    if (this.isQueryPending(key)) {
      const pendingPromise = this.getPendingQuery(key);
      if (pendingPromise) {
        return pendingPromise as Promise<T>;
      }
    }

    const promise = queryFn();
    this.addPendingQuery(key, promise);

    return promise;
  }

  /**
   * Clear all pending queries
   */
  clear(): void {
    this.pendingQueries.clear();
  }

  /**
   * Get pending queries count
   */
  getPendingCount(): number {
    return this.pendingQueries.size;
  }
}

export const queryDeduplicationMiddleware = new QueryDeduplicationMiddleware();

