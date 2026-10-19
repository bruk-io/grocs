// Test support: in-memory fakes and contract suites (R48, R49). Imported as "@grocs/ports/testing",
// by tests only. The main entry carries interfaces alone, because Metro bundles whatever a shipped
// file imports and a fake auth must never reach a release build (R53).
export { eventually, rejection, sleep } from './testing.ts';
export type { Matchers, TestApi } from './testing.ts';

export { FakeClock } from './clock/fake.ts';
export { clockContract } from './clock/contract.ts';
export type { ClockSubject } from './clock/contract.ts';

export { SequentialIds } from './ids/fake.ts';
export { idsContract } from './ids/contract.ts';

export { MemoryLogger } from './logging/fake.ts';
export { loggerContract } from './logging/contract.ts';
export type { LoggerSubject } from './logging/contract.ts';

export { FakeAuth } from './auth/fake.ts';
export { authContract, googleSignInContract, testSignInContract } from './auth/contract.ts';
export type { AuthSubject, GoogleSignInSubject, TestSignInSubject } from './auth/contract.ts';

export { InMemorySyncStore } from './sync-store/fake.ts';
export { syncStoreContract } from './sync-store/contract.ts';
export type { SyncStoreSubject } from './sync-store/contract.ts';
