/**
 * Mock for @umituz/react-native-firebase
 */

export class FirebaseError extends Error {
  code: string;
  originalError?: unknown;

  constructor(message: string, code?: string, originalError?: unknown) {
    super(message);
    this.name = 'FirebaseError';
    this.code = code || 'UNKNOWN';
    this.originalError = originalError;
  }
}

export function getFirebaseApp(): any {
  return null;
}

export function initializeFirebase(): any {
  return null;
}