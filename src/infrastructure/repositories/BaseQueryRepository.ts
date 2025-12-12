/**
 * Base Repository - Query Operations
 *
 * Provides query and tracking operations for Firestore repositories.
 * Extends BaseRepository with query-specific functionality.
 */

import type { Firestore, Query, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { quotaTrackingMiddleware } from "../middleware/QuotaTrackingMiddleware";
import { queryDeduplicationMiddleware } from "../middleware/QueryDeduplicationMiddleware";
import type { PaginationParams } from "../../types/pagination.types";
import { BaseRepository } from "./BaseRepository";

export abstract class BaseQueryRepository extends BaseRepository {
  /**
   * Execute query with deduplication and quota tracking
   * Prevents duplicate queries and tracks quota usage
   *
   * @param collection - Collection name
   * @param query - Firestore query
   * @param queryFn - Function to execute the query
   * @param cached - Whether the result is from cache
   * @returns Query result
   */
  protected async executeQuery<T>(
    collection: string,
    query: Query,
    queryFn: () => Promise<T>,
    cached: boolean = false,
  ): Promise<T> {
    const queryKey = {
      collection,
      filters: query.toString(),
      limit: undefined,
      orderBy: undefined,
    };

    return queryDeduplicationMiddleware.deduplicate(queryKey, async () => {
      return quotaTrackingMiddleware.trackOperation(
        {
          type: 'read',
          collection,
          count: 1,
          cached,
        },
        queryFn,
      );
    });
  }

  /**
   * Track read operation
   *
   * @param collection - Collection name
   * @param count - Number of documents read
   * @param cached - Whether the result is from cache
   */
  protected trackRead(
    collection: string,
    count: number = 1,
    cached: boolean = false,
  ): void {
    quotaTrackingMiddleware.trackRead(collection, count, cached);
  }

  /**
   * Track write operation
   *
   * @param collection - Collection name
   * @param documentId - Document ID (optional)
   * @param count - Number of documents written
   */
  protected trackWrite(
    collection: string,
    documentId?: string,
    count: number = 1,
  ): void {
    quotaTrackingMiddleware.trackWrite(collection, documentId, count);
  }

  /**
   * Track delete operation
   *
   * @param collection - Collection name
   * @param documentId - Document ID (optional)
   * @param count - Number of documents deleted
   */
  protected trackDelete(
    collection: string,
    documentId?: string,
    count: number = 1,
  ): void {
    quotaTrackingMiddleware.trackDelete(collection, documentId, count);
  }
}