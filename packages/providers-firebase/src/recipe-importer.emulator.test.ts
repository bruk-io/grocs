import { createHash } from 'node:crypto';
import { recipeImporterContract } from '@grocs/ports/testing';
import { describe, expect, it } from 'vitest';
import { createEmulatorClient, ensureSeeded, writeRaw } from '../../../firebase/emulator-client.ts';
import type { EmulatorClient } from '../../../firebase/emulator-client.ts';
import { FirebaseRecipeImporter } from './recipe-importer.ts';
import { asSdk } from './sdk.ts';
import type { FunctionsFns } from './sdk.ts';

const KNOWN_URL = 'https://recipe.invalid/pancakes';
const REMEMBERED_URL = 'https://recipe.invalid/blocked-page';

/** Matches the server's key: sha256 hex of the (already-normalised) URL. Computed here, not imported from providers-server (AC#4). */
function recipeKey(url: string): string {
  return createHash('sha256').update(url).digest('hex');
}

function importerFor(client: EmulatorClient): FirebaseRecipeImporter {
  const fns = asSdk<FunctionsFns>(client.functionsFns);
  return new FirebaseRecipeImporter(fns, client.functions);
}

async function anonymousImporter(label: string): Promise<{ client: EmulatorClient; importer: FirebaseRecipeImporter }> {
  await ensureSeeded();
  const client = createEmulatorClient(label);
  await client.authFns.signInAnonymously(client.auth);
  return { client, importer: importerFor(client) };
}

// The same suite the fake passes (R29), now through the real importRecipe Cloud Function, over
// HTTP, in the Functions emulator - the only layer that proves the onCall wrapper itself (auth
// enforcement, HttpsError mapping), not just the cache lookup inside it (that's
// packages/providers-server's own emulator test). Seeded cache docs stand in for the server
// already having imported (or failed to import) each URL, exactly the shapes the server itself
// writes (contract §11).
recipeImporterContract({ describe, it, expect }, async () => {
  const known = await anonymousImporter('fri-known');

  const knownKey = recipeKey(KNOWN_URL);
  await writeRaw(`recipes/${knownKey}`, {
    schemaVersion: 1,
    url: KNOWN_URL,
    recipe: {
      recipeId: knownKey,
      sourceUrl: KNOWN_URL,
      title: 'Pancakes',
      yield: '4 servings',
      steps: ['Mix the batter.', 'Cook on a griddle.'],
      ingredients: [{ line: '1 cup flour', quantity: '1', unit: 'cup', item: 'flour' }],
      image: null,
    },
    parserVersion: 1,
    fetchedAt: Date.now(),
  });

  const rememberedKey = recipeKey(REMEMBERED_URL);
  await writeRaw(`recipeFailures/${rememberedKey}`, {
    schemaVersion: 1,
    error: 'blocked',
    failedAt: Date.now(),
  });

  return {
    importer: known.importer,
    known: { url: KNOWN_URL, recipeId: knownKey, title: 'Pancakes' },
    remembered: { url: REMEMBERED_URL, error: 'blocked' },
    invalidUrl: 'not a link',
    async dispose() {
      await known.client.dispose();
    },
  };
});

describe('FirebaseRecipeImporter: unauthenticated calls', () => {
  it('rejects importRecipe with no one signed in', async () => {
    const client = createEmulatorClient('fri-anon');
    try {
      await expect(importerFor(client).importRecipe(KNOWN_URL)).rejects.toThrow();
    } finally {
      await client.dispose();
    }
  });
});
