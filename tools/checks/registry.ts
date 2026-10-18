// Every check, in the order they run. Adding a check means adding it here, which is
// why a check that is not listed cannot quietly stop running.
import type { Check } from './lib.ts';
import { check as consoleUse } from './console-use.ts';
import { check as firebaseIsolation } from './firebase-isolation.ts';
import { check as importLayers } from './import-layers.ts';

export const checks: readonly Check[] = [importLayers, consoleUse, firebaseIsolation];
