/**
 * Jest setup file
 */

// Mock __DEV__ for tests
export {};

declare global {
  var __DEV__: boolean | undefined;
}

if (typeof (global as any).__DEV__ === 'undefined') {
  (global as any).__DEV__ = true;
}

// Mock console methods to avoid noise in tests
const originalConsole = { ...console };

beforeEach(() => {
  // Restore console methods before each test
  Object.assign(console, originalConsole);
});

// Set up global test utilities
global.mockFirestore = () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  runTransaction: jest.fn(),
  batch: jest.fn(),
});

global.mockFirebaseError = (code: string, message: string) => {
  const error = new Error(message) as any;
  error.code = code;
  return error;
};