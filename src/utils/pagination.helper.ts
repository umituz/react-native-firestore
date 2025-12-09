/**
 * Pagination Helper
 *
 * Utilities for cursor-based pagination in Firestore.
 * Handles pagination logic, cursor management, and hasMore detection.
 *
 * App-agnostic: Works with any document type and any collection.
 *
 * @example
 * ```typescript
 * import { PaginationHelper } from '@umituz/react-native-firestore';
 *
 * const helper = new PaginationHelper<Post>();
 * const result = helper.buildResult(posts, 10, post => post.id);
 * ```
 */

import type { PaginatedResult, PaginationParams } from '../types/pagination.types';

export class PaginationHelper<T> {
  /**
   * Build paginated result from items
   *
   * @param items - All items fetched (should be limit + 1)
   * @param pageLimit - Requested page size
   * @param getCursor - Function to extract cursor from item
   * @returns Paginated result with hasMore and nextCursor
   */
  buildResult(
    items: T[],
    pageLimit: number,
    getCursor: (item: T) => string,
  ): PaginatedResult<T> {
    const hasMore = items.length > pageLimit;
    const resultItems = hasMore ? items.slice(0, pageLimit) : items;
    const nextCursor = hasMore && resultItems.length > 0
      ? getCursor(resultItems[resultItems.length - 1])
      : null;

    return {
      items: resultItems,
      nextCursor,
      hasMore,
    };
  }

  /**
   * Get default limit from params or use default
   *
   * @param params - Pagination params
   * @param defaultLimit - Default limit if not specified
   * @returns Page limit
   */
  getLimit(params?: PaginationParams, defaultLimit: number = 10): number {
    return params?.limit || defaultLimit;
  }

  /**
   * Calculate fetch limit (page limit + 1 for hasMore detection)
   *
   * @param pageLimit - Requested page size
   * @returns Fetch limit (pageLimit + 1)
   */
  getFetchLimit(pageLimit: number): number {
    return pageLimit + 1;
  }

  /**
   * Check if params has cursor
   *
   * @param params - Pagination params
   * @returns true if cursor exists
   */
  hasCursor(params?: PaginationParams): boolean {
    return !!params?.cursor;
  }
}

/**
 * Create pagination helper for a specific type
 *
 * @returns PaginationHelper instance
 *
 * @example
 * ```typescript
 * const helper = createPaginationHelper<Post>();
 * const result = helper.buildResult(posts, 10, post => post.id);
 * ```
 */
export function createPaginationHelper<T>(): PaginationHelper<T> {
  return new PaginationHelper<T>();
}
