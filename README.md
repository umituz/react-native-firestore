# @umituz/react-native-firestore

Firestore operations and BaseRepository for React Native apps - Centralized Firestore utilities for hundreds of apps.

## Features

- ✅ **BaseRepository**: Base class for all Firestore repositories
- ✅ **Date Utilities**: ISO string ↔ Firestore Timestamp conversion
- ✅ **App-Agnostic**: Works with any app, no app-specific code
- ✅ **Type-Safe**: Full TypeScript support
- ✅ **DDD Architecture**: Domain-Driven Design principles
- ✅ **SOLID Principles**: Clean, maintainable code

## Installation

```bash
npm install @umituz/react-native-firestore @umituz/react-native-firebase firebase
```

## Prerequisites

This package requires:
- `@umituz/react-native-firebase` - Firebase initialization
- `firebase` - Firebase SDK

Make sure to initialize Firebase before using this package:

```typescript
import { initializeFirebase } from '@umituz/react-native-firebase';

await initializeFirebase({
  apiKey: '...',
  authDomain: '...',
  projectId: '...',
  // ... other config
});
```

## Usage

### BaseRepository

Extend `BaseRepository` for all your Firestore repositories:

```typescript
import { BaseRepository } from '@umituz/react-native-firestore';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';

export class UserRepository extends BaseRepository {
  async getUser(userId: string) {
    const db = this.getDb();
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    return userSnap.data();
  }

  async createUser(userId: string, data: any) {
    const db = this.getDb();
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, data);
  }
}
```

### Date Utilities

Convert between ISO strings and Firestore Timestamps:

```typescript
import { isoToTimestamp, timestampToISO, timestampToDate } from '@umituz/react-native-firestore';

// ISO string → Firestore Timestamp
const timestamp = isoToTimestamp("2024-01-01T00:00:00.000Z");

// Firestore Timestamp → ISO string
const isoString = timestampToISO(timestamp);

// Firestore Timestamp → Date
const date = timestampToDate(timestamp);

// Current ISO string
const now = getCurrentISOString();
```

## Architecture

This package follows Domain-Driven Design (DDD) principles:

- **Infrastructure Layer**: BaseRepository, database access
- **Utils Layer**: Date utilities, timestamp conversion

## Design Principles

- **DRY**: Don't Repeat Yourself - Centralized database access
- **SOLID**: Single Responsibility - Each class has one purpose
- **KISS**: Keep It Simple - Simple, straightforward API
- **App-Agnostic**: Works with any app, no app-specific code

## License

MIT

## Author

Ümit UZ <umit@umituz.com>

