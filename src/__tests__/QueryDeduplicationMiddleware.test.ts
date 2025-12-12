/**
 * Tests for QueryDeduplicationMiddleware
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { QueryDeduplicationMiddleware } from '../infrastructure/middleware/QueryDeduplicationMiddleware';

describe('QueryDeduplicationMiddleware', () => {
  let middleware: QueryDeduplicationMiddleware;

  beforeEach(() => {
    middleware = new QueryDeduplicationMiddleware();
    jest.useFakeTimers();
  });

  afterEach(() => {
    middleware.destroy();
    jest.useRealTimers();
  });

  describe('deduplicate', () => {
    it('should execute query immediately if not pending', async () => {
      const queryFn = jest.fn().mockResolvedValue('result');
      const queryKey = {
        collection: 'test',
        filters: 'field == value',
        limit: 10,
        orderBy: 'createdAt',
      };

      const result = await middleware.deduplicate(queryKey, queryFn);
      expect(result).toBe('result');
      expect(queryFn).toHaveBeenCalledTimes(1);
    });

    it('should deduplicate identical queries within window', async () => {
      const queryFn = jest.fn().mockResolvedValue('result');
      const queryKey = {
        collection: 'test',
        filters: 'field == value',
        limit: 10,
        orderBy: 'createdAt',
      };

      const promise1 = middleware.deduplicate(queryKey, queryFn);
      const promise2 = middleware.deduplicate(queryKey, queryFn);

      const [result1, result2] = await Promise.all([promise1, promise2]);
      expect(result1).toBe('result');
      expect(result2).toBe('result');
      expect(queryFn).toHaveBeenCalledTimes(1);
    });

    it('should execute new query after deduplication window', async () => {
      const queryFn = jest.fn().mockResolvedValue('result');
      const queryKey = {
        collection: 'test',
        filters: 'field == value',
        limit: 10,
        orderBy: 'createdAt',
      };

      await middleware.deduplicate(queryKey, queryFn);
      expect(queryFn).toHaveBeenCalledTimes(1);

      // Advance time beyond deduplication window
      jest.advanceTimersByTime(1100);

      await middleware.deduplicate(queryKey, queryFn);
      expect(queryFn).toHaveBeenCalledTimes(2);
    });

    it('should handle different query keys separately', async () => {
      const queryFn = jest.fn().mockResolvedValue('result');
      const queryKey1 = {
        collection: 'test1',
        filters: 'field == value',
        limit: 10,
        orderBy: 'createdAt',
      };
      const queryKey2 = {
        collection: 'test2',
        filters: 'field == value',
        limit: 10,
        orderBy: 'createdAt',
      };

      await middleware.deduplicate(queryKey1, queryFn);
      await middleware.deduplicate(queryKey2, queryFn);

      expect(queryFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('cleanup', () => {
    it('should clean up expired queries automatically', async () => {
      const queryFn = jest.fn().mockResolvedValue('result');
      const queryKey = {
        collection: 'test',
        filters: 'field == value',
        limit: 10,
        orderBy: 'createdAt',
      };

      await middleware.deduplicate(queryKey, queryFn);
      expect(middleware.getPendingCount()).toBe(0);

      // Advance time to trigger cleanup
      jest.advanceTimersByTime(6000);
      expect(middleware.getPendingCount()).toBe(0);
    });
  });

  describe('clear', () => {
    it('should clear all pending queries', async () => {
      const queryFn = jest.fn(() => new Promise(() => {})); // Never resolves
      const queryKey = {
        collection: 'test',
        filters: 'field == value',
        limit: 10,
        orderBy: 'createdAt',
      };

      middleware.deduplicate(queryKey, queryFn);
      expect(middleware.getPendingCount()).toBe(1);

      middleware.clear();
      expect(middleware.getPendingCount()).toBe(0);
    });
  });

  describe('destroy', () => {
    it('should cleanup resources and clear queries', () => {
      const queryKey = {
        collection: 'test',
        filters: 'field == value',
        limit: 10,
        orderBy: 'createdAt',
      };

      middleware.deduplicate(queryKey, () => Promise.resolve('result'));
      middleware.destroy();

      expect(middleware.getPendingCount()).toBe(0);
    });
  });
});