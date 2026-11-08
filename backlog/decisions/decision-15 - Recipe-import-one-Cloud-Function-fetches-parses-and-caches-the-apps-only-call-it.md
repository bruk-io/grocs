---
id: decision-15
title: >-
  Recipe import: one Cloud Function fetches, parses and caches; the apps only
  call it
date: '2026-11-07 01:04'
status: accepted
---
## Context

TASK-74 adds a recipe to a kitchen from a link. Bruk set the shape on Nov 6, 2026: the apps know nothing about recipe sites or parsing. They send a URL to Grocs' server and get a parsed recipe back. The server fetches and parses only when it has no cached copy. Public pages only, one cache shared by every kitchen, kept indefinitely, the raw JSON-LD kept apart from the parsed recipe, and a failed URL not fetched again for a day. It is proven locally in the Functions emulator before any deployment work.

A probe on Nov 6 found complete schema.org Recipe JSON-LD on six logged-out NYT Cooking pages, all marked `isAccessibleForFree: false`. A `curl` with only a browser User-Agent got a page with no recipe data, while Python `requests` got the full page.

Kitchen create and join already have this shape (decision-13): a port in `packages/ports`, a client in `providers-firebase` that only calls a callable, and the work in `providers-server`, wired in `apps/functions`.

One gap: `tools/checks/import-layers.ts` lets the `app` layer import any provider. `unitOf` already knows which app a file is in, but the table is keyed by layer only, so nothing stops `apps/mobile` importing `@grocs/providers-server`. No app does today. The only mention in a phone bundle is a comment in `providers-firebase`.

## Decision

**Where the code lives.** Recipe import follows the kitchen-gateway shape. No new package or layer.

| Where | What |
|---|---|
| `packages/core/src/model/recipe.ts` | The shared contract, types only: `ParsedRecipe` (title, yield, steps, ingredients, source URL, image) and `ParsedIngredient` (`line` as written, plus `quantity`, `unit` and `item`, each possibly null), and `RecipeImportError`: `'invalid-url' \| 'not-found' \| 'blocked' \| 'unreachable' \| 'not-a-recipe' \| 'incomplete-recipe'`. |
| `packages/ports/src/recipe-importer/` | `RecipeImporter.importRecipe(url)` returning a `Result` of `ParsedRecipe` or `RecipeImportError`, with `fake.ts` and `contract.ts`. The app reaches it through an application command, like `CreateKitchen` (R28, decision-13). |
| `packages/providers-firebase` | `FirebaseRecipeImporter`: calls the `importRecipe` callable and nothing else. |
| `packages/providers-server/src/recipe/pure/` | Pure code: HTML to Recipe JSON-LD to `ParsedRecipe`, the ingredient-line parser, and URL normalisation. No network, clock or I/O. |
| `packages/providers-server/src/recipe/` | `importRecipe(url, deps)`, which runs cache, failure memory, fetch and parse with `fetchPage`, the cache and the clock passed in, plus the live `fetchPage` and the Firestore cache. |
| `apps/functions/src/index.ts` | The `importRecipe` callable. It requires a signed-in caller and a `url` string, then wires the live dependencies. |

**Keeping the apps out.** These are enforced by checks, not left as conventions:
- A new rule, `import-layers/app-providers`, in `tools/checks/import-layers.ts`. It keeps a per-app list of the provider packages each app may import:
  - `apps/mobile`: `providers-firebase`, `providers-device` and `providers-memory`. Never `providers-server`.
  - `apps/functions`: `providers-server` only.
- `core-purity` is extended to cover `packages/providers-server/src/recipe/pure/`, so the parsing is held to the same rules as `core`. It covers only `core` today.

**The cache**, Firestore, written only with the Admin SDK:
- `recipes/{key}`: the parsed recipe, the URL, `parserVersion` and `fetchedAt`.
- `recipeSources/{key}`: the raw Recipe JSON-LD object and `fetchedAt`. It is a separate collection, so reading a recipe never loads the raw object.
- `recipeFailures/{key}`: the error kind and `failedAt`. Within 24 hours of `failedAt` the function returns that error without fetching. A later success deletes the document.
- `key` is the SHA-256 of the normalised URL. Normalising keeps http(s) only, lowercases scheme and host, and drops the fragment, `utm_*`, `fbclid` and `gclid`. It also sorts the remaining query parameters and drops a trailing slash.
- Nothing expires. `parserVersion` records which parser produced a recipe. Re-parsing from `recipeSources` after a parser change is a later script, not automatic.
- `firebase/firestore.rules` denies every client read and write on the three collections, with deny tests in `firebase/firestore.rules.test.ts`.

**Fetching.**
- Node `fetch` with browser-like `User-Agent`, `Accept` and `Accept-Language` headers and no cookies. Each fetch has a 10 s timeout, at most 5 MB of body and at most 5 redirects.
- The function fetches URLs that users supply, so it guards against server-side request forgery. It allows only http and https on ports 80 and 443. It resolves the host and refuses loopback, private and link-local addresses, which includes the metadata server at 169.254.169.254. It repeats the check on every redirect.
- Status mapping:

  | HTTP response | Error |
  |---|---|
  | 404 or 410 | `not-found` |
  | 401, 403 or 429 | `blocked` |
  | Timeouts, other failures and the guard's refusals | `unreachable` |
  | No Recipe JSON-LD in the page | `not-a-recipe` |
  | A Recipe with no ingredients or no steps | `incomplete-recipe` |

**Testing without live sites.** `importRecipe` takes `fetchPage` as a parameter. Unit tests and emulator tests pass a fake that serves saved pages, so no automated test fetches a real site. The emulator tests cover a cache hit, a miss, the failure memory and each error. The SSRF guard is pure (an address check) and unit-tested.

**Logging.** No URL or recipe content is logged (R36). Failures are logged by error kind only.

**Locally,** `pnpm emulators` runs `importRecipe` in the Functions emulator. Imports run by hand fetch live sites, which is the intended local proof. Deploying belongs to the infrastructure intent, "Grocs' Firebase project and deploys are code".

Proposed by Claude on Nov 7, 2026, from the shape Bruk set on Nov 6. Accepted by Bruk on Nov 7, 2026.

## Consequences

- doc-1 changes in two places: the layout (`providers-server` holds recipe import) and R26/R27 (the per-app provider rule). The update is filed as a follow-up and not made until this decision is accepted.
- The per-app rule closes the existing gap for kitchen code too: `apps/mobile` can no longer import `KitchenStore` by accident.
- TASK-74.3 lands the contract types, the pure parsing, both check changes and the fixtures. TASK-74.4 lands the cache, the fetcher, the rules and the callable. TASK-74.5 lands the port, the command and the client. The port lives with the app side because only the app calls it.
- The cache is shared because everything in it is public. A source that needs a login would need a per-user cache. That is not supported (TASK-74).
- Every failure is remembered for a day, including `unreachable`, so a site that is briefly down blocks that URL for a day. That is accepted for the first pass as the simplest rule.
- The Admin SDK bypasses security rules, so only server code can write the cache. A bug there writes bad data for every kitchen. The contract tests and `parserVersion` are the guard.
