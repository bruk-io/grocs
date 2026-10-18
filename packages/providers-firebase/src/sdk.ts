// The slice of the Firebase modular API these providers use. The names and call shapes are the
// same in the web SDK (`firebase/firestore`, `firebase/auth`) and the native one
// (`@react-native-firebase/firestore`, `@react-native-firebase/auth`), so one provider runs on both:
//   - on the phones, the composition root passes the native modules;
//   - in Node tests, the tests pass the web SDK connected to the emulators (native modules cannot run in Node).
// The providers import no Firebase package themselves. What this does not prove is in the
// TASK-1.4 notes: native offline persistence, native listener timing, native error shapes.

export interface DocumentSnapshotLike {
  exists(): boolean;
  data(): unknown;
}

export interface QuerySnapshotLike {
  readonly docs: readonly { readonly id: string; data(): unknown }[];
}

export interface TransactionLike {
  get(ref: unknown): Promise<DocumentSnapshotLike>;
  set(ref: unknown, data: unknown): unknown;
}

export interface FirestoreFns {
  collection(parent: unknown, path: string, ...pathSegments: string[]): unknown;
  doc(parent: unknown, path: string, ...pathSegments: string[]): unknown;
  query(source: unknown, ...constraints: unknown[]): unknown;
  where(field: string, op: '==', value: unknown): unknown;
  getDocs(query: unknown): Promise<QuerySnapshotLike>;
  onSnapshot(
    query: unknown,
    observer: { next: (snapshot: QuerySnapshotLike) => void; error: (error: Error) => void },
  ): () => void;
  runTransaction<T>(db: unknown, update: (transaction: TransactionLike) => Promise<T>): Promise<T>;
}

export interface AuthUserLike {
  readonly uid: string;
  readonly email: string | null;
  readonly displayName: string | null;
}

export interface AuthFns {
  onAuthStateChanged(auth: unknown, next: (user: AuthUserLike | null) => void): () => void;
  signInWithEmailAndPassword(auth: unknown, email: string, password: string): Promise<{ readonly user: AuthUserLike }>;
  signOut(auth: unknown): Promise<void>;
}

/**
 * The SDK's own types are overloaded and richer than the slice above. Passing a module through this
 * function states, in one visible place, that the module is being used as that slice.
 */
export function asSdk<T>(module: unknown): T {
  return module as T;
}
