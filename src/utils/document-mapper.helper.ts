/**
 * Document Mapper Helper
 *
 * Utilities for batch document processing with enrichment.
 * Handles document extraction, validation, and enrichment with related data.
 *
 * App-agnostic: Works with any document type and any enrichment logic.
 *
 * @example
 * ```typescript
 * import { DocumentMapperHelper } from '@umituz/react-native-firestore';
 *
 * const mapper = new DocumentMapperHelper<Post, User, EnrichedPost>();
 * const enriched = await mapper.mapWithEnrichment(
 *   postDocs,
 *   post => extractPost(post),
 *   post => post.userId,
 *   userId => userRepo.getById(userId),
 *   (post, user) => ({ ...post, user })
 * );
 * ```
 */

import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

export class DocumentMapperHelper<TSource, TEnrichment, TResult> {
  /**
   * Map documents with enrichment from related data
   *
   * Process flow:
   * 1. Extract source data from document
   * 2. Skip if extraction fails or source is invalid
   * 3. Get enrichment key from source
   * 4. Fetch enrichment data using the key
   * 5. Skip if enrichment data not found
   * 6. Combine source and enrichment into result
   *
   * @param docs - Firestore document snapshots
   * @param extractSource - Extract source data from document
   * @param getEnrichmentKey - Get enrichment key from source
   * @param fetchEnrichment - Fetch enrichment data by key
   * @param combineData - Combine source and enrichment into result
   * @returns Array of enriched results
   */
  async mapWithEnrichment(
    docs: QueryDocumentSnapshot<DocumentData>[],
    extractSource: (doc: QueryDocumentSnapshot<DocumentData>) => TSource | null,
    getEnrichmentKey: (source: TSource) => string,
    fetchEnrichment: (key: string) => Promise<TEnrichment | null>,
    combineData: (source: TSource, enrichment: TEnrichment) => TResult,
  ): Promise<TResult[]> {
    const results: TResult[] = [];

    for (const doc of docs) {
      const source = extractSource(doc);
      if (!source) continue;

      const enrichmentKey = getEnrichmentKey(source);
      const enrichment = await fetchEnrichment(enrichmentKey);
      if (!enrichment) continue;

      results.push(combineData(source, enrichment));
    }

    return results;
  }

  /**
   * Map documents with multiple enrichments
   *
   * Similar to mapWithEnrichment but supports multiple enrichment sources.
   * Useful when result needs data from multiple related collections.
   *
   * @param docs - Firestore document snapshots
   * @param extractSource - Extract source data from document
   * @param getEnrichmentKeys - Get all enrichment keys from source
   * @param fetchEnrichments - Fetch all enrichment data by keys
   * @param combineData - Combine source and enrichments into result
   * @returns Array of enriched results
   */
  async mapWithMultipleEnrichments<TEnrichments extends Record<string, unknown>>(
    docs: QueryDocumentSnapshot<DocumentData>[],
    extractSource: (doc: QueryDocumentSnapshot<DocumentData>) => TSource | null,
    getEnrichmentKeys: (source: TSource) => Record<string, string>,
    fetchEnrichments: (keys: Record<string, string>) => Promise<TEnrichments | null>,
    combineData: (source: TSource, enrichments: TEnrichments) => TResult,
  ): Promise<TResult[]> {
    const results: TResult[] = [];

    for (const doc of docs) {
      const source = extractSource(doc);
      if (!source) continue;

      const enrichmentKeys = getEnrichmentKeys(source);
      const enrichments = await fetchEnrichments(enrichmentKeys);
      if (!enrichments) continue;

      results.push(combineData(source, enrichments));
    }

    return results;
  }

  /**
   * Simple document mapping without enrichment
   *
   * @param docs - Firestore document snapshots
   * @param extractData - Extract data from document
   * @returns Array of extracted data (nulls filtered out)
   */
  map(
    docs: QueryDocumentSnapshot<DocumentData>[],
    extractData: (doc: QueryDocumentSnapshot<DocumentData>) => TResult | null,
  ): TResult[] {
    const results: TResult[] = [];

    for (const doc of docs) {
      const data = extractData(doc);
      if (data) {
        results.push(data);
      }
    }

    return results;
  }
}

/**
 * Create document mapper helper
 *
 * @returns DocumentMapperHelper instance
 *
 * @example
 * ```typescript
 * const mapper = createDocumentMapper<Post, User, EnrichedPost>();
 * const enriched = await mapper.mapWithEnrichment(...);
 * ```
 */
export function createDocumentMapper<
  TSource,
  TEnrichment,
  TResult,
>(): DocumentMapperHelper<TSource, TEnrichment, TResult> {
  return new DocumentMapperHelper<TSource, TEnrichment, TResult>();
}
