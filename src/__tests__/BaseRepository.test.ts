/**
 * Tests for BaseRepository
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { BaseRepository } from '../infrastructure/repositories/BaseRepository';
import { getFirestore, resetFirestoreClient } from '../infrastructure/config/FirestoreClient';

// Mock Firestore client
jest.mock('../infrastructure/config/FirestoreClient', () => ({
  getFirestore: jest.fn(),
  resetFirestoreClient: jest.fn(),
}));

const mockGetFirestore = getFirestore as jest.MockedFunction<typeof getFirestore>;
const mockResetFirestoreClient = resetFirestoreClient as jest.MockedFunction<typeof resetFirestoreClient>;

describe('BaseRepository', () => {
  let repository: BaseRepository;

  beforeEach(() => {
    repository = new BaseRepository();
    jest.clearAllMocks();
  });

  afterEach(() => {
    repository.destroy();
  });

  describe('getDb', () => {
    it('should return Firestore instance when available', () => {
      const mockFirestore = {} as any;
      mockGetFirestore.mockReturnValue(mockFirestore);

      const result = repository.getDb();
      expect(result).toBe(mockFirestore);
    });

    it('should return null when Firestore is not available', () => {
      mockGetFirestore.mockReturnValue(null);

      const result = repository.getDb();
      expect(result).toBeNull();
    });

    it('should return null when repository is destroyed', () => {
      repository.destroy();
      const result = repository.getDb();
      expect(result).toBeNull();
    });
  });

  describe('getDbOrThrow', () => {
    it('should return Firestore instance when available', () => {
      const mockFirestore = {} as any;
      mockGetFirestore.mockReturnValue(mockFirestore);

      const result = repository.getDbOrThrow();
      expect(result).toBe(mockFirestore);
    });

    it('should throw error when Firestore is not available', () => {
      mockGetFirestore.mockReturnValue(null);

      expect(() => repository.getDbOrThrow()).toThrow(
        'Firestore is not initialized. Please initialize Firebase App first.'
      );
    });
  });

  describe('isDbInitialized', () => {
    it('should return true when Firestore is available', () => {
      mockGetFirestore.mockReturnValue({} as any);

      const result = repository.isDbInitialized();
      expect(result).toBe(true);
    });

    it('should return false when Firestore is not available', () => {
      mockGetFirestore.mockReturnValue(null);

      const result = repository.isDbInitialized();
      expect(result).toBe(false);
    });

    it('should return false when getFirestore throws', () => {
      mockGetFirestore.mockImplementation(() => {
        throw new Error('Test error');
      });

      const result = repository.isDbInitialized();
      expect(result).toBe(false);
    });
  });

  describe('executeWithQuotaHandling', () => {
    it('should execute operation successfully', async () => {
      const mockOperation = jest.fn().mockResolvedValue('success');
      const result = await repository.executeWithQuotaHandling(mockOperation);
      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('should handle quota errors', async () => {
      const quotaError = new Error('Quota exceeded');
      const mockOperation = jest.fn().mockRejectedValue(quotaError);
      
      // Mock quota error detection
      jest.spyOn(repository, 'isQuotaError').mockReturnValue(true);
      jest.spyOn(repository, 'handleQuotaError').mockImplementation(() => {
        throw new Error('Quota error handled');
      });

      await expect(repository.executeWithQuotaHandling(mockOperation)).rejects.toThrow('Quota error handled');
    });

    it('should re-throw non-quota errors', async () => {
      const regularError = new Error('Regular error');
      const mockOperation = jest.fn().mockRejectedValue(regularError);
      
      jest.spyOn(repository, 'isQuotaError').mockReturnValue(false);

      await expect(repository.executeWithQuotaHandling(mockOperation)).rejects.toThrow('Regular error');
    });
  });

  describe('destroy', () => {
    it('should mark repository as destroyed', () => {
      repository.destroy();
      expect(repository.getDb()).toBeNull();
    });
  });
});