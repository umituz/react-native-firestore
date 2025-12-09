/**
 * Pagination Types
 *
 * Generic types for cursor-based pagination in Firestore.
 * Used across hundreds of apps for consistent pagination interface.
 *
 * @example
 * ```typescript
 * const result: PaginatedResult<Post> = await repository.getPosts({ limit: 10 });
 * console.log(result.items); // Post[]
 * console.log(result.hasMore); // boolean
 * console.log(result.nextCursor); // string | null
 * ```
 */

/**
 * Pagination parameters for queries
 */
export interface PaginationParams {
  /**
   * Maximum number of items to return
   * @default 10
   */
  limit?: number;

  /**
   * Cursor for pagination (document ID)
   * Use this to fetch next page
   */
  cursor?: string;
}

/**
 * Paginated result structure
 */
export interface PaginatedResult<T> {
  /**
   * Array of items in current page
   */
  items: T[];

  /**
   * Cursor for next page (null if no more items)
   */
  nextCursor: string | null;

  /**
   * Whether there are more items to fetch
   */
  hasMore: boolean;
}

/**
 * Empty paginated result
 */
export const EMPTY_PAGINATED_RESULT: PaginatedResult<never> = {
  items: [],
  nextCursor: null,
  hasMore: false,
};
