// Every check, in the order they run. Adding a check means adding it here, which is
// why a check that is not listed cannot quietly stop running.
import type { Check } from './lib.ts';
import { check as agentDefinitions } from './agent-definitions.ts';
import { check as consoleUse } from './console-use.ts';
import { check as corePurity } from './core-purity.ts';
import { check as designTokens } from './design-tokens.ts';
import { check as firebaseIsolation } from './firebase-isolation.ts';
import { check as importLayers } from './import-layers.ts';
import { check as portContracts } from './port-contracts.ts';
import { check as storyCoverage } from './story-coverage.ts';
import { check as testPresence } from './test-presence.ts';

export const checks: readonly Check[] = [
  importLayers,
  agentDefinitions,
  consoleUse,
  corePurity,
  firebaseIsolation,
  designTokens,
  storyCoverage,
  testPresence,
  portContracts,
];
