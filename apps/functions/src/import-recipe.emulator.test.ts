// Proves the importRecipe callable itself (TASK-74.4.7, contract §12), over HTTP in the Functions
// emulator: auth enforcement, argument validation, and that the Result it hands back is plain data,
// never a thrown error. packages/providers-firebase/src/recipe-importer.emulator.test.ts already runs
// the shared RecipeImporter contract (cache hit, remembered failure, invalid-url) through
// FirebaseRecipeImporter; this file covers what that port can't express (an httpsCallable with no
// url at all) and a direct, Admin-seeded cache hit, with no provider class in between. No real
// domain appears anywhere here: every seeded URL uses the reserved, non-resolvable host recipe.invalid.
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { createEmulatorClient, ensureSeeded, writeRaw } from '../../../firebase/emulator-client.ts';
import type { EmulatorClient } from '../../../firebase/emulator-client.ts';

// Unique per run (TASK-74.4.10): the cache a prior run wrote for this exact URL would otherwise
// still be there on a second run against long-lived emulators, masking a regression in the seed
// path below. No query string and no trailing slash, so normaliseRecipeUrl leaves it unchanged.
const SEEDED_URL = `https://recipe.invalid/import-recipe-callable-${Date.now()}`;

/** Matches the server's key: sha256 hex of the (already-normalised) URL. */
function recipeKey(url: string): string {
  return createHash('sha256').update(url).digest('hex');
}

function callableFor(client: EmulatorClient) {
  return client.functionsFns.httpsCallable(client.functions, 'importRecipe');
}

async function signedInClient(label: string): Promise<EmulatorClient> {
  await ensureSeeded();
  const client = createEmulatorClient(label);
  await client.authFns.signInAnonymously(client.auth);
  return client;
}

describe('importRecipe callable', () => {
  it('rejects a call with no one signed in', async () => {
    const client = createEmulatorClient('irc-anon');
    try {
      await expect(callableFor(client)({ url: SEEDED_URL })).rejects.toThrow();
    } finally {
      await client.dispose();
    }
  });

  it('gives invalid-argument for a call with no url', async () => {
    const client = await signedInClient('irc-no-url');
    try {
      await expect(callableFor(client)({})).rejects.toMatchObject({ code: 'functions/invalid-argument' });
    } finally {
      await client.dispose();
    }
  });

  it("returns {ok:false,error:'invalid-url'} as data for a url that is not http(s)", async () => {
    const client = await signedInClient('irc-not-a-link');
    try {
      const { data } = await callableFor(client)({ url: 'not a link' });
      expect(data).toEqual({ ok: false, error: 'invalid-url' });
    } finally {
      await client.dispose();
    }
  });

  it('returns an Admin-seeded recipe for an already-normalised recipe.invalid URL', async () => {
    const client = await signedInClient('irc-seeded');
    const key = recipeKey(SEEDED_URL);
    try {
      await writeRaw(`recipes/${key}`, {
        schemaVersion: 1,
        url: SEEDED_URL,
        recipe: {
          recipeId: key,
          sourceUrl: SEEDED_URL,
          title: 'Seeded Recipe',
          yield: '2 servings',
          steps: ['Combine.', 'Serve.'],
          ingredients: [{ line: '1 egg', quantity: '1', unit: null, item: 'egg' }],
          image: null,
        },
        parserVersion: 1,
        fetchedAt: Date.now(),
      });

      const { data } = await callableFor(client)({ url: SEEDED_URL });
      expect(data).toEqual({
        ok: true,
        value: {
          recipeId: key,
          sourceUrl: SEEDED_URL,
          title: 'Seeded Recipe',
          yield: '2 servings',
          steps: ['Combine.', 'Serve.'],
          ingredients: [{ line: '1 egg', quantity: '1', unit: null, item: 'egg' }],
          image: null,
        },
      });
    } finally {
      await client.dispose();
    }
  });
});
