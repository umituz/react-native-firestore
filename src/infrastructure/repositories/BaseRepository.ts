/**
 * Base Repository
 *
 * Provides common Firestore operations with centralized database access.
 * All Firestore repositories should extend this class.
 *
 * Architecture:
 * - DRY: Centralized database access (getDb)
 * - SOLID: Single Responsibility - Database access only
 * - KISS: Simple base class with protected db property
 * - App-agnostic: Works with any app, no app-specific code
 *
 * This class is designed to be used across hundreds of apps.
 * It provides a consistent interface for Firestore operations.
 *
 * @example
 * ```typescript
 * import { BaseRepository } from '@umituz/react-native-firestore';
 *
 * export class MyRepository extends BaseRepository {
 *   async create(data: MyData): Promise<MyData> {
 *     const db = this.getDbOrThrow();
 *     // Use db for Firestore operations
 *   }
 * }
 * ```
 */

import type { Firestore, Query, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { collection, query, orderBy, limit, startAfter, getDocs, getDoc, doc } from "firebase/firestore";
import { getFirestore } from "../config/FirestoreClient";
import {
  isQuotaError as checkQuotaError,
  getQuotaErrorMessage,
} from "../../utils/quota-error-detector.util";
import { FirebaseFirestoreQuotaError } from "../../domain/errors/FirebaseFirestoreError";
import { quotaTrackingMiddleware } from "../middleware/QuotaTrackingMiddleware";
import { queryDeduplicationMiddleware } from "../middleware/QueryDeduplicationMiddleware";
import { PaginationHelper } from "../../utils/pagination.helper";
import type { PaginatedResult, PaginationParams } from "../../types/pagination.types";

export class BaseRepository {
  /**
   * Get Firestore database instance
   * Returns null if Firestore is not initialized (offline mode)
   * Use getDbOrThrow() if you need to throw an error instead
   *
   * @returns Firestore instance or null if not initialized
   */
  protected getDb(): Firestore | null {
    return getFirestore();
  }

  /**
   * Get Firestore database instance or throw error
   * Throws error if Firestore is not initialized
   * Use this method when Firestore is required for the operation
   *
   * @returns Firestore instance
   * @throws Error if Firestore is not initialized
   */
  protected getDbOrThrow(): Firestore {
    const db = getFirestore();
    if (!db) {
      throw new Error("Firestore is not initialized. Please call initializeFirebase() first.");
    }
    return db;
  }

  /**
   * Check if Firestore is initialized
   * Useful for conditional operations
   *
   * @returns true if Firestore is initialized, false otherwise
   */
  protected isDbInitialized(): boolean {
    try {
      const db = getFirestore();
      return db !== null;
    } catch {
      return false;
    }
  }

  /**
   * Check if error is a quota error
   * Quota errors indicate daily read/write/delete limits are exceeded
   *
   * @param error - Error to check
   * @returns true if error is a quota error
   */
  protected isQuotaError(error: unknown): boolean {
    return checkQuotaError(error);
  }

  /**
   * Handle quota error
   * Throws FirebaseFirestoreQuotaError with user-friendly message
   *
   * @param error - Original error
   * @throws FirebaseFirestoreQuotaError
   */
  protected handleQuotaError(error: unknown): never {
    const message = getQuotaErrorMessage();
    throw new FirebaseFirestoreQuotaError(message, error);
  }

  /**
   * Wrap Firestore operation with quota error handling
   * Automatically detects and handles quota errors
   *
   * @param operation - Firestore operation to execute
   * @returns Result of the operation
   * @throws FirebaseFirestoreQuotaError if quota error occurs
   */
  protected async executeWithQuotaHandling<T>(
    operation: () => Promise<T>,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (this.isQuotaError(error)) {
        this.handleQuotaError(error);
      }
      throw error;
    }
  }

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

  /**
   * Execute paginated query with cursor support
   *
   * Generic helper for cursor-based pagination queries.
   * Automatically handles cursor document fetching and result building.
   *
   * @param collectionName - Firestore collection name
   * @param params - Pagination parameters
   * @param orderByField - Field to order by (default: "createdAt")
   * @param orderDirection - Sort direction (default: "desc")
   * @param additionalFilters - Optional query constraints
   * @returns QueryDocumentSnapshot array (limit + 1 for hasMore detection)
   *
   * @example
   * ```typescript
   * const docs = await this.executePaginatedQuery("posts", { limit: 10 }, "createdAt");
   * const helper = new PaginationHelper<Post>();
   * return helper.buildResult(posts, params.limit, post => post.id);
   * ```
   */
  protected async executePaginatedQuery(
    collectionName: string,
    params?: PaginationParams,
    orderByField: string = "createdAt",
    orderDirection: "asc" | "desc" = "desc",
  ): Promise<QueryDocumentSnapshot<DocumentData>[]> {
    const db = this.getDbOrThrow();
    const helper = new PaginationHelper();
    const pageLimit = helper.getLimit(params);
    const fetchLimit = helper.getFetchLimit(pageLimit);

    const collectionRef = collection(db, collectionName);
    let q = query(
      collectionRef,
      orderBy(orderByField, orderDirection),
      limit(fetchLimit),
    );

    if (helper.hasCursor(params)) {
      const cursorDoc = await getDoc(doc(db, collectionName, params!.cursor!));
      if (cursorDoc.exists()) {
        q = query(
          collectionRef,
          orderBy(orderByField, orderDirection),
          startAfter(cursorDoc),
          limit(fetchLimit),
        );
      }
    }

    const snapshot = await getDocs(q);
    this.trackRead(collectionName, snapshot.docs.length, snapshot.metadata.fromCache);
    return snapshot.docs;
  }

  /**
   * Build paginated result from documents
   *
   * Helper to convert raw Firestore documents to paginated result.
   * Works with any document type and cursor extraction logic.
   *
   * @param docs - Firestore document snapshots
   * @param params - Pagination parameters
   * @param extractData - Function to extract data from document
   * @param getCursor - Function to extract cursor from data
   * @returns Paginated result
   *
   * @example
   * ```typescript
   * return this.buildPaginatedResult(
   *   docs,
   *   params,
   *   doc => extractPost(doc),
   *   post => post.id
   * );
   * ```
   */
  protected buildPaginatedResult<T>(
    docs: QueryDocumentSnapshot<DocumentData>[],
    params: PaginationParams | undefined,
    extractData: (doc: QueryDocumentSnapshot<DocumentData>) => T | null,
    getCursor: (item: T) => string,
  ): PaginatedResult<T> {
    const items: T[] = [];
    for (const doc of docs) {
      const data = extractData(doc);
      if (data) items.push(data);
    }

    const helper = new PaginationHelper<T>();
    const pageLimit = helper.getLimit(params);
    return helper.buildResult(items, pageLimit, getCursor);
  }
}

