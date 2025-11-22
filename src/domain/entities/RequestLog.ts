/**
 * Request Log Entity
 * Domain entity for tracking Firestore requests
 */

export type RequestType = 'read' | 'write' | 'delete' | 'listener';

export interface RequestLog {
  id: string;
  type: RequestType;
  collection: string;
  documentId?: string;
  timestamp: number;
  duration?: number;
  success: boolean;
  error?: string;
  cached: boolean;
}

export interface RequestStats {
  totalRequests: number;
  readRequests: number;
  writeRequests: number;
  deleteRequests: number;
  listenerRequests: number;
  cachedRequests: number;
  failedRequests: number;
  averageDuration: number;
}

