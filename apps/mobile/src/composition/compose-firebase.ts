import type { RuntimeInfo } from '@grocs/application';
import { RandomIds, SystemClock } from '@grocs/providers-device';
import { FirebaseAuth, FirebaseKitchenGateway, FirestoreSyncStore } from '@grocs/providers-firebase';
import type { AuthFns, FirestoreFns, FunctionsFns } from '@grocs/providers-firebase';
import type { Clock, IdGenerator, Logger } from '@grocs/ports';
import { composeApp } from './compose-app.ts';
import type { App } from './compose-app.ts';

/**
 * The Firebase SDK, as the providers use it. On the phones this is the native SDK
 * (`@react-native-firebase`); the emulator tests pass the web SDK, which has the same modular API
 * and can run in Node.
 */
export interface FirebaseModules {
  readonly firestore: FirestoreFns;
  readonly auth: AuthFns;
  readonly db: unknown;
  readonly authInstance: unknown;
  /** The Cloud Functions SDK and instance behind the kitchen gateway. */
  readonly functions: { readonly fns: FunctionsFns; readonly instance: unknown };
}

export interface FirebaseAppOptions {
  readonly firebase: FirebaseModules;
  readonly logger: Logger;
  readonly runtime: RuntimeInfo;
  readonly copyText: (text: string) => Promise<void>;
  readonly clock?: Clock;
  readonly ids?: IdGenerator;
}

export function composeFirebaseApp({ firebase, logger, runtime, copyText, clock, ids }: FirebaseAppOptions): App {
  return composeApp({
    ports: {
      syncStore: new FirestoreSyncStore(firebase.firestore, firebase.db),
      auth: new FirebaseAuth(firebase.auth, firebase.authInstance),
      kitchens: new FirebaseKitchenGateway(firebase.functions.fns, firebase.functions.instance),
      clock: clock ?? new SystemClock(),
      ids: ids ?? new RandomIds(),
    },
    logger,
    runtime,
    copyText,
  });
}
