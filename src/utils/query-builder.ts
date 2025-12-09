/**
 * Query Builder Utility
 * Single Responsibility: Build Firestore queries with advanced filtering
 *
 * App-agnostic utility for building Firestore queries.
 * Supports:
 * - Firestore 'in' operator (up to 10 values)
 * - Firestore 'or' operator (for >10 values via chunking)
 * - Single value filtering
 * - Multiple field filtering
 * - Date range filtering
 * - Sorting
 * - Limiting
 *
 * This utility is designed to be used across hundreds of apps.
 * It provides a consistent interface for Firestore query building.
 */

import {
  collection,
  query,
  where,
  orderBy,
  limit as limitQuery,
  startAfter,
  or,
  type Firestore,
  type Query,
  Timestamp,
  type WhereFilterOp,
} from "firebase/firestore";

export interface FieldFilter {
  field: string;
  operator: WhereFilterOp;
  value: string | number | boolean | string[] | number[];
}

export interface QueryBuilderOptions {
  collectionName: string;
  baseFilters?: FieldFilter[];
  dateRange?: {
    field: string;
    startDate?: number;
    endDate?: number;
  };
  sort?: {
    field: string;
    order?: "asc" | "desc";
  };
  limitValue?: number;
  /**
   * Cursor value for pagination (timestamp in milliseconds)
   * Used with startAfter for cursor-based pagination
   */
  cursorValue?: number;
}

const MAX_IN_OPERATOR_VALUES = 10;

/**
 * Build Firestore query with advanced filtering support
 *
 * @param db - Firestore database instance
 * @param options - Query builder options
 * @returns Firestore Query object
 */
export function buildQuery(
  db: Firestore,
  options: QueryBuilderOptions,
): Query {
  const {
    collectionName,
    baseFilters = [],
    dateRange,
    sort,
    limitValue,
    cursorValue,
  } = options;

  const collectionRef = collection(db, collectionName);
  let q: Query = collectionRef;

  // Apply base filters
  for (const filter of baseFilters) {
    q = applyFieldFilter(q, filter);
  }

  // Apply date range filters
  if (dateRange) {
    if (dateRange.startDate) {
      q = query(
        q,
        where(
          dateRange.field,
          ">=",
          Timestamp.fromMillis(dateRange.startDate),
        ),
      );
    }
    if (dateRange.endDate) {
      q = query(
        q,
        where(
          dateRange.field,
          "<=",
          Timestamp.fromMillis(dateRange.endDate),
        ),
      );
    }
  }

  // Apply sorting
  if (sort) {
    const sortOrder = sort.order || "desc";
    q = query(q, orderBy(sort.field, sortOrder));
  }

  // Apply cursor for pagination (must come after orderBy)
  if (cursorValue !== undefined) {
    q = query(q, startAfter(Timestamp.fromMillis(cursorValue)));
  }

  // Apply limit
  if (limitValue !== undefined) {
    q = query(q, limitQuery(limitValue));
  }

  return q;
}

/**
 * Apply field filter with support for 'in' operator and chunking
 * Handles arrays by using 'in' operator (up to 10 values)
 * For arrays >10 values, splits into chunks and uses 'or' operator
 */
function applyFieldFilter(q: Query, filter: FieldFilter): Query {
  const { field, operator, value } = filter;

  // Handle 'in' operator with array values
  if (operator === "in" && Array.isArray(value)) {
    // Firestore 'in' operator supports up to 10 values
    if (value.length <= MAX_IN_OPERATOR_VALUES) {
      return query(q, where(field, "in", value));
    }

    // Split into chunks of 10 and use 'or' operator
    const chunks: (string[] | number[])[] = [];
    for (let i = 0; i < value.length; i += MAX_IN_OPERATOR_VALUES) {
      chunks.push(value.slice(i, i + MAX_IN_OPERATOR_VALUES));
    }

    const orConditions = chunks.map((chunk) => where(field, "in", chunk));
    return query(q, or(...orConditions));
  }

  // Standard filter
  return query(q, where(field, operator, value));
}

/**
 * Helper: Create a field filter for 'in' operator
 * Automatically handles chunking if array >10 values
 */
export function createInFilter(
  field: string,
  values: string[] | number[],
): FieldFilter {
  return {
    field,
    operator: "in",
    value: values,
  };
}

/**
 * Helper: Create a field filter for equality
 */
export function createEqualFilter(
  field: string,
  value: string | number | boolean,
): FieldFilter {
  return {
    field,
    operator: "==",
    value,
  };
}
