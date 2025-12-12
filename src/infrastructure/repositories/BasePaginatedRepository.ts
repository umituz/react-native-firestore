/**
 * Base Repository - Pagination Operations
 *
 * Provides pagination operations for Firestore repositories.
 * Extends BaseQueryRepository with pagination-specific functionality.
 */

import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { collection, query, orderBy, limit, startAfter, getDoc, doc, getDocs } from "firebase/firestore";
import { PaginationHelper } from "../../utils/pagination.helper";
import type { PaginatedResult, PaginationParams } from "../../types/pagination.types";
import { BaseQueryRepository } from "./BaseQueryRepository";

export abstract class BasePaginatedRepository extends BaseQueryRepository {
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
   * @returns QueryDocumentSnapshot array (limit + 1 for hasMore detection)
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