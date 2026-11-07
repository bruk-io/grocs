---
id: TASK-74
title: Add a recipe to a kitchen from a link
status: To Do
assignee:
  - '@bruk'
created_date: '2026-11-07 00:38'
updated_date: '2026-11-07 03:20'
labels:
  - size-8
  - core
  - providers
dependencies: []
documentation:
  - doc-1
type: intent
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem
Getting a recipe into Grocs today means typing it in, but most recipes people cook come from a link to a recipe site. Spec doc-1 parked recipe-link ingredient extraction so it would not block the first version; this picks it up. Supporting many sites must not mean one parser per site, and Grocs should not hit third-party sites more than it needs to.

First pass, as Bruk scoped it on 2026-11-06:
- The apps know nothing about recipe sites or parsing. They send a URL to Grocs' Cloud Function and get a parsed recipe (or an error) back. The function returns the cached recipe if it has one; otherwise it fetches the page, parses it, caches it and returns it.
- The only recipe code the apps share with the server is the contract: the parsed recipe type and the error kinds. Fetching, both parsers, JSON-LD handling, the cache and the failure memory are server-only code that the apps cannot import, checked by an import-layer rule.
- Public pages only. Anything that needs a login is out of scope.
- Imported ingredients go straight onto the grocery list.
- Each ingredient line is parsed into quantity, unit and item, and the line as written is kept alongside. The app does not act on units yet: no combining or converting quantities on the grocery list.
- The raw schema.org Recipe JSON-LD object (not the whole page) is kept on the server, separate from the parsed recipe, so a parser change can re-run without fetching the site.
- Imported recipes are cached on the server indefinitely, and one cache is shared by every kitchen because everything in it is public. If a source that needs a login is ever supported, its content must be cached per user, never in the shared cache.
- A URL whose fetch failed is not tried again for 1 day.
- Search across recipe sites is later, not now.

The parsing is two separate pieces, both pure functions in server-only code:
- Reading the schema: finding the Recipe node (top level, array or @graph; @type may be a list) and normalising its variants (instructions as a string, strings, HowToStep or nested HowToSection; yield as string, number or list; image as string, object or list; ISO 8601 durations; HTML entities). Same for every site.
- Ingredient lines: recipeIngredient is free text, so quantity, unit and item come from a rule-based parser (Unicode fractions, mixed numbers, ranges, bracketed sizes like '1 (14-ounce) can', a note after the first comma, lines with no quantity). Best effort; quantity and unit may be empty, and the line as written is the source of truth.

## Affected users and systems
- Kitchen members adding recipes and meals.
- Shared: the parsed recipe type and error kinds, and the kitchen data that holds an imported recipe (core); the app's import port (ports).
- Server only: the parsers and fetcher (a server-only package; where exactly is part of the server-side decision, since spec doc-1's layout has no server-only domain package), apps/functions (the callable, cache and failure memory), firebase rules.
- App: providers-firebase (the call to the function), ui and app (the paste-a-link flow).
- Today a Meal holds only a name and a link (packages/core/src/model/meal.ts), and a grocery Item holds a free-text amount and badges naming the meals it is for (packages/core/src/model/item.ts). There is no recipe in kitchen data yet.

## Evidence
A logged-out probe of six NYT Cooking recipes on 2026-11-06 (same browser User-Agent as Bruk's nyt-cooking-mcp client, no cookie) found complete schema.org Recipe JSON-LD on all six (ingredients, steps, yield), although every one is marked isAccessibleForFree: false. A plain curl with the same User-Agent got a 102 KB page with no recipe data, so a fetch that returns HTTP 200 can still hold nothing usable.

## Open questions
- [x] Where the server side lives: a Cloud Function with a Firestore cache, deployed through the existing firebase.json (functions codebase apps/functions, Firestore rules and indexes). Bruk agreed 2026-11-06; to be recorded as a decision, including where the server-only parsing package sits in the layers.
- [x] Whether imported ingredients go on the grocery list: yes, all of them, for the first pass.
- [x] How far ingredient parsing goes: quantity, unit and item, with the original line kept. The app holds off on using units.
- [x] How long cached recipes are kept: indefinitely for now.
- [x] How long a failed fetch is remembered: 1 day.
- [x] Whether to keep the source after parsing: keep the raw Recipe JSON-LD object on the server, separate from the parsed recipe; not the whole page.
- [x] Carried forward: search across recipe sites comes later, after import works.
- [x] Carried forward: where an imported recipe lives in kitchen data (its own record, or on the Meal whose link it came from) and how its ingredients become grocery Items (name, amount, meal badge, aisle). It blocks only the app flow, so it is answered by a design child before that child starts, while the server side proceeds.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A member can paste a public recipe URL and get a recipe with its title, ingredients, steps and yield saved in their kitchen
- [ ] #2 Each imported ingredient is parsed into quantity, unit and item, with the line as written kept alongside; the app does not combine or convert units yet
- [ ] #3 Importing a recipe adds all of its ingredients to the kitchen's grocery list
- [ ] #4 The imported recipe is a copy in the kitchen's data; viewing it later never fetches the source site
- [ ] #5 A site with valid schema.org Recipe JSON-LD imports without any site-specific code
- [ ] #6 A page with no usable recipe (no ingredients or no steps) is never saved, and the member is told why; pages that need a login are not supported
- [ ] #7 The apps never contact a recipe site: they send a URL to the Cloud Function and receive a parsed recipe or an error
- [ ] #8 The apps contain no fetching or parsing code: they share only the parsed recipe type and error kinds, and an import-layer check fails the build if app code imports the server-only recipe code
- [ ] #9 A URL any kitchen has already imported is served from the shared server cache without fetching the site again
- [ ] #10 The server keeps each imported page's raw Recipe JSON-LD separately from the parsed recipe, and can re-parse from it without fetching the site
- [ ] #11 A URL whose fetch failed is not fetched again for 1 day
- [ ] #12 Recipe and ingredient-line parsing are pure and tested against saved pages from at least five sites
- [ ] #13 The import function runs locally in the Functions emulator started by pnpm emulators, and a locally run app imports recipes through it
- [ ] #14 Must not break: kitchen data stays readable and writable only by its members (R4), and no recipe URL or content is written to logs (R36)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
# TASK-74 slice contract (recipe import from a link)

Sources: decision-15 (server-side import), decision-16 (kitchen recipes), decision-3 (agent workflow). Once reviewed, this contract is frozen. A builder who needs to change it writes the request in its task notes and stops (decision-3 mediation). It does not improvise.

## 0. Cross-layer decisions frozen here
1. **Fan-out of ingredients.** `ImportRecipe` imports, saves the kitchen recipe and relinks the meal. Its `RecipeImported` event carries the grocery lines and the normalised `sourceUrl`. The **screen** then dispatches one ordinary `AddItem` per line, with `mealId` and the meal's `weekId`. This is decision-16's "dispatches one AddItem per ingredient", read literally: `CommandContext` has no dispatcher, so a handler cannot do it. R12's combine prompt is not built yet (no "combine" code exists in packages or apps), so a duplicate is added as a separate item. orch-ac-rewording records that on decision-16 and TASK-74.5 and files a follow-up for R12. Nothing claims the prompt exists.
2. **Failure shape.** Import failures are `err({ code, message })`, following AddMeal/EditMeal. `code` is exactly one of the `RecipeImportError` strings, `'recipe-deleted'`, `'not-signed-in'`, `'meal-not-found'` or `'internal'` (dispatcher or impossible branch). `message` never contains the URL or recipe content (R36).
3. **Deps field name:** `recipeImporter` (required, no `?`). Instrumented log records carry `{ port: 'recipeImporter', method: 'importRecipe' }`.
4. **No automated test fetches a site.** `RecipeImporterSubject` provides URLs, not pages. The Firebase provider runs the same suite through the Functions emulator, whose callable uses the live fetcher. That is safe only because every seeded URL uses the reserved, non-resolvable host `recipe.invalid` and is already normalised (lowercase, no query, no fragment, no trailing slash). A key mismatch then fails as `unreachable` instead of fetching a real site.
5. **Collection naming.** Code always says which collection it means. The server cache is top-level `recipes/{key}` (Admin SDK only). The kitchen record is `kitchens/{kitchenId}/recipes/{recipeId}`. The two share the same id value.
6. **Delete wins over re-import (resolves decision-16's line 26 vs line 52).** recipeId is deterministic and R20 says a delete always wins, so a re-imported copy can never clear a tombstone. R20, a numbered spec requirement, wins over decision-16's consequence "importing again restores the recipe from the server cache". `ImportRecipe` checks for a tombstone and returns `err({code:'recipe-deleted'})`, storing nothing and leaving the meal unrelinked. orch-ac-rewording appends this to decision-16 through the backlog CLI. No delete command exists in this slice, but a member can write a tombstone directly, which the kitchen rule allows.
7. **Every commit is green.** lefthook pre-commit runs `node tools/checks/run.ts --mode staged`, repo-wide `pnpm -s typecheck` and the unit suite in every worktree. No commit may use `--no-verify`. Two widenings break other packages, so each lands as an **integration group**: several layer builders edit one shared worktree in sequence, none of them commits, and the orchestrator commits once everything is green. That follows the c4db885 precedent (TASK-1.21.2/.3/.4) and is recorded as a decision-3 deviation in the task notes.
   - **Group A (SyncStore widening):** ports-sync-store-recipes, providers-memory-recipes, providers-firestore-recipes and application-sync-literals, committed by orch-integrate-sync-store. The break surface is exactly six sites: InMemorySyncStore, MemorySyncStore, FirestoreSyncStore, and the three `: SyncStore = {` literals in add-item.scenario.test.ts (lines 54, 91, 166).
   - **Group B (Deps widening):** application-recipe-deps and app-compose-recipes, committed by orch-integrate-deps. FakeRecipeImporter, MemoryRecipeImporter, FirebaseRecipeImporter and watchKitchenRecipes must already be on main.
   - port-contracts/method-covered fires as soon as port.ts declares a method that contract.ts does not call. So port.ts, fake.ts, contract.ts and fake.test.ts always change together.

## 1. Core: `packages/core/src/model/recipe.ts` (types only, decision-15)
```ts
// The recipe-import contract shared by the apps and the server (decision-15), and the kitchen record (decision-16). Types only.
import type { Stamp } from '../merge/lww.ts';

/** One ingredient line. `line` is the source of truth; the parsed parts are best effort. */
export interface ParsedIngredient {
  /** As written, trimmed, non-empty. */
  readonly line: string;
  /** As written in the line, e.g. '1 1/2', '½', '2-3'; null when the line has none. */
  readonly quantity: string | null;
  /** As written, e.g. 'cup', 'tbsp', '(14-ounce) can'; null when the line has none. */
  readonly unit: string | null;
  /** The thing to buy, e.g. 'chickpeas'; null when it cannot be told apart. */
  readonly item: string | null;
}

/** What the import function returns. recipeId = server cache key (sha256 hex of sourceUrl). */
export interface ParsedRecipe {
  readonly recipeId: string;
  /** The normalised URL (contract section 9). */
  readonly sourceUrl: string;
  /** Non-empty. */
  readonly title: string;
  /** e.g. '4 servings'; a number or a list is normalised to one string. */
  readonly yield: string | null;
  /** At least one, flattened from HowToSection. */
  readonly steps: readonly string[];
  /** At least one. */
  readonly ingredients: readonly ParsedIngredient[];
  /** Absolute URL. */
  readonly image: string | null;
}

/** Why an import failed (decision-15). */
export type RecipeImportError =
  | 'invalid-url' | 'not-found' | 'blocked' | 'unreachable' | 'not-a-recipe' | 'incomplete-recipe';

/** A kitchen record at kitchens/{kitchenId}/recipes/{id} (decision-16). Content is written once and never restamped. */
export interface Recipe {
  /** Equals ParsedRecipe.recipeId. */
  readonly id: string;
  readonly addedBy: string;
  readonly createdAt: number;
  readonly sourceUrl: string;
  readonly title: string;
  readonly yield: string | null;
  readonly steps: readonly string[];
  readonly ingredients: readonly ParsedIngredient[];
  readonly image: string | null;
  /** Once set it stays (R20). */
  readonly deleted: Stamp | null;
}
```
recipe.ts exports types only, so test-presence and core-purity's function rules have nothing to check. All four are re-exported as types from `packages/core/src/index.ts`.

## 2. Core: `packages/core/src/model/kitchen-recipe.ts` (with `kitchen-recipe.test.ts`)
```ts
export interface GroceryLine { readonly name: string; readonly amount: string | null; }
/** The kitchen record for an import: id = recipeId, addedBy = stamp.by, createdAt = stamp.at, deleted null. */
export function recipeFromImport(parsed: ParsedRecipe, stamp: Stamp): Recipe;
/** The live (not deleted) recipe whose sourceUrl === link, or null. Null link → null. */
export function recipeForLink(recipes: readonly Recipe[], link: string | null): Recipe | null;
/** decision-16: name = item ?? line; amount = [quantity, unit] non-null parts joined by ' ', or null. */
export function groceryLineFor(ingredient: ParsedIngredient): GroceryLine;
```

## 3. Core: `packages/core/src/schema/recipe-doc.ts` (with `recipe-doc.test.ts`)
```ts
export const RECIPE_SCHEMA_VERSION = 1;
export interface RecipeDoc {
  readonly schemaVersion: typeof RECIPE_SCHEMA_VERSION;
  readonly id: string; readonly addedBy: string; readonly createdAt: number;
  readonly sourceUrl: string; readonly title: string; readonly yield: string | null;
  readonly steps: readonly string[];
  readonly ingredients: readonly { line: string; quantity: string | null; unit: string | null; item: string | null }[];
  readonly image: string | null;
  readonly deleted: { at: number; by: string } | null;
}
export function encodeRecipe(recipe: Recipe): RecipeDoc;
export function decodeRecipe(raw: unknown): Result<Recipe, SchemaError>; // SchemaError from ./item-doc.ts
```
Content is stored plain, not as `{v,at,by}`. decode checks `schemaVersion` first (`unsupported-version`). It then checks every field, naming the path: `steps.2`, `ingredients.3.line`, `ingredients.0.quantity`, `deleted.at`.

## 4. Core: `packages/core/src/merge/recipe-merge.ts` (with `recipe-merge.test.ts`)
```ts
/** Throws on different ids. first = earlier createdAt, tie → addedBy <= (as mergeMeal). Content, addedBy, createdAt from first; deleted = laterStamp(a.deleted, b.deleted). */
export function mergeRecipe(a: Recipe, b: Recipe): Recipe;
export function isRecipeDeleted(recipe: Recipe): boolean;
```
Property tests hold the content constant per recipe id, and say why in a comment: the same recipeId comes from the same server cache entry, and `first` has no content tiebreak. A tombstone is never cleared by a later copy with `deleted: null` (§0.6).

## 5. Core: `packages/core/src/schema/personal.ts` additions (R36)
```ts
{ entity: 'recipe', shape: ['sourceUrl', 'ingredients'], personal: ['title', 'sourceUrl', 'ingredients', 'steps', 'image'] },
{ entity: 'ingredient', shape: ['line', 'item'], personal: ['line', 'quantity', 'unit', 'item'] },
```
These give the attribute keys recipeTitle, recipeSourceUrl, recipeIngredients, recipeSteps, recipeImage, ingredientLine, ingredientQuantity, ingredientUnit and ingredientItem. The recipe entry matches a domain `Recipe`, a `RecipeDoc` and a bare `ParsedRecipe`. `image` goes beyond decision-16's list because it is a recipe URL (R36). The orchestrator records that on TASK-74.7.

## 6. Ports: SyncStore additions (`packages/ports/src/sync-store/port.ts`), Group A
```ts
/** Merge this copy of a kitchen recipe. Merging the same copy twice changes nothing; a delete is never undone. */
mergeRecipe(kitchenId: string, recipe: Recipe): Promise<void>;
/** Every recipe of the kitchen (any week), deleted ones included (they are tombstones). */
getRecipes(kitchenId: string): Promise<readonly Recipe[]>;
/** Call onRecipes with the kitchen's recipes (tombstones included) soon after subscribing and on every change. */
watchRecipes(kitchenId: string, onRecipes: (recipes: readonly Recipe[]) => void, onError?: (error: Error) => void): Unsubscribe;
```
These are direct method signatures on `SyncStore` (decision-16). In `contract.ts`, `export function syncStoreRecipeContract(t: TestApi, make: () => Promise<SyncStoreSubject>): void` literally calls `.mergeRecipe(`, `.getRecipes(` and `.watchRecipes(`. It is exported from `test-support.ts` and called in `fake.test.ts`, `providers-memory/src/memory-sync-store.test.ts` and `providers-firebase/src/firestore-sync-store.emulator.test.ts`. port-contracts does not force the last two calls, because syncStoreContract already satisfies provider-runs-contract, so they are wired by hand and checked by AC.

## 7. Ports: `packages/ports/src/recipe-importer/`
```ts
// port.ts
export interface RecipeImporter {
  /** Ask Grocs' server for the recipe at url. Never contacts a recipe site itself. */
  importRecipe(url: string): Promise<Result<ParsedRecipe, RecipeImportError>>;
}
// fake.ts
export type RecipeImportOutcome = ParsedRecipe | RecipeImportError;
export class FakeRecipeImporter implements RecipeImporter {
  constructor(entries?: Iterable<readonly [url: string, outcome: RecipeImportOutcome]>);
  /** URLs passed to importRecipe, in order (test inspection only). */
  get calls(): readonly string[];
  importRecipe(url: string): Promise<Result<ParsedRecipe, RecipeImportError>>;
  // seeded URL (exact string) → seeded outcome; else non-http(s) or unparseable → 'invalid-url'; else → 'not-a-recipe'
}
// contract.ts
export interface RecipeImporterSubject {
  readonly importer: RecipeImporter;
  /** An already-normalised URL on host recipe.invalid that the server has cached (seeded), with what it must return. */
  readonly known: { readonly url: string; readonly recipeId: string; readonly title: string };
  /** An already-normalised URL on host recipe.invalid whose failure is remembered (seeded), and the error it must return. */
  readonly remembered: { readonly url: string; readonly error: Exclude<RecipeImportError, 'invalid-url'> };
  /** Not an http(s) URL, e.g. 'not a link' or 'ftp://x'. */
  readonly invalidUrl: string;
  dispose?(): Promise<void>;
}
export function recipeImporterContract(t: TestApi, make: () => Promise<RecipeImporterSubject>): void;
```
Contract cases:
- `known.url` returns ok, with a matching `recipeId` and `title`, `sourceUrl === known.url`, and at least one ingredient and one step.
- Importing `known.url` twice gives the same `recipeId`.
- `remembered.url` returns err(`remembered.error`).
- `invalidUrl` returns err('invalid-url').
- No case needs network access.

`index.ts` exports the `RecipeImporter` type. `test-support.ts` exports `FakeRecipeImporter`, `RecipeImportOutcome`, `recipeImporterContract` and `RecipeImporterSubject`. None of these is on the main entry (R53).

## 8. Application
```ts
// dispatch/types.ts (Group B)
export interface Deps { ...existing; readonly recipeImporter: RecipeImporter; }
// instrumentDeps: recipeImporter: instrumentPort('recipeImporter', deps.recipeImporter, ...)
// testing/client.ts: TestClientOptions gains `recipeImporter?: RecipeImporter` (default new FakeRecipeImporter());
//   the returned client also exposes `recipeImporter`.

// queries/watch-kitchen-recipes.ts (+ .test.ts); lands after Group A and before Group B
export function watchKitchenRecipes(store: SyncStore, kitchenId: string, onRecipes: (recipes: readonly Recipe[]) => void, onError?: (error: Error) => void): Unsubscribe; // live recipes only (tombstones filtered)

// commands/import-recipe.ts (+ import-recipe.scenario.test.ts); lands after Group B
export interface ImportRecipe {
  readonly type: 'ImportRecipe';
  readonly kitchenId: string;
  readonly weekId: string;
  readonly mealId: string;
  readonly url: string;
}
export interface RecipeImported extends DomainEvent {
  readonly type: 'RecipeImported';
  readonly recipeId: string;
  readonly mealId: string;
  readonly weekId: string;
  /** The normalised URL the meal now links to; the screen puts it in its link field. */
  readonly sourceUrl: string;
  /** One per ingredient, in recipe order, from core groceryLineFor. The screen dispatches one AddItem per line. */
  readonly groceries: readonly GroceryLine[];
}
export async function importRecipe(command: ImportRecipe, ctx: CommandContext): Promise<CommandResult>;
```
Order of work in the handler (nothing is stored before step 6):
1. No user → `err({code:'not-signed-in'})`.
2. Find the live meal through `syncStore.getMeals(kitchenId, weekId)`. If there is none → `err({code:'meal-not-found'})`, and the importer is not called.
3. Call `recipeImporter.importRecipe(url)`. On err → `err({ code: <the RecipeImportError>, message: 'the recipe could not be imported' })`.
4. Call `syncStore.getRecipes(kitchenId)`. If it holds a recipe with `id === parsed.recipeId` that `isRecipeDeleted` → `err({code:'recipe-deleted', message:'that recipe was removed from this kitchen'})` (§0.6).
5. Set stamp = `{at: clock.now(), by: uid}`, then `relinkMeal(meal, parsed.sourceUrl, stamp)`. On err (impossible for a normalised http(s) URL) → `err({code:'internal', message:'the recipe could not be imported'})`.
6. `syncStore.mergeRecipe(kitchenId, recipeFromImport(parsed, stamp))`, then `syncStore.mergeMeal(kitchenId, relinked)`.
7. Return `ok([RecipeImported{ recipeId, mealId, weekId, sourceUrl: parsed.sourceUrl, groceries: parsed.ingredients.map(groceryLineFor) }])`.

Register the handler in `commands/index.ts`. Export `importRecipe`, `ImportRecipe`, `RecipeImported` and `watchKitchenRecipes` from `src/index.ts`.

## 9. Server: `packages/providers-server/src/recipe/pure/`
This folder is a decision-15 exception to providers-hold-no-rules. Non-test files have no network, clock, I/O, node built-ins or third-party imports. They import only `@grocs/core` and siblings inside pure/, and each has a test (test-presence). Test files may read fixtures with `node:fs`.
```ts
// ingredient-line.ts
export function parseIngredientLine(line: string): ParsedIngredient;

// normalise-url.ts
export function normaliseRecipeUrl(raw: string): Result<string, 'invalid-url'>;
```
Exact algorithm for `normaliseRecipeUrl`:
1. Trim the input and parse it with `new URL`. A throw → `invalid-url`.
2. If `protocol` is not `http:` or `https:` → `invalid-url`. A non-empty `username` or `password` → `invalid-url`.
3. `host` = `url.host`. WHATWG lowercases it and drops the default port.
4. `path` = `url.pathname`, with every trailing `/` stripped, so `/` and `//` give `''` and `/a//` gives `/a`. (Amended 2026-11-07 by the orchestrator: stripping only one slash made `https://x.com//` normalise to `https://x.com/` and then to `https://x.com`, breaking idempotence; found by reviewer-providers on TASK-74.4.3.)
5. `query` = the raw `url.search` without its leading `?`, split on `&`. Drop empty parts, any key matching `/^utm_/i`, and the keys `fbclid` and `gclid` (case-insensitive). Stable-sort by the raw key, then by the raw value. Rejoin with `&`, keeping the original encoding with no re-encoding and no URLSearchParams. If nothing is left, there is no `?`.
6. The fragment is always dropped.
7. Result: `${protocol}//${host}${path}${query ? '?' + query : ''}`.

The function is idempotent: normalise(normalise(x)) === normalise(x). Its output passes core relinkMeal. A golden table of at least 10 input/output pairs lives in normalise-url.test.ts.

```ts
// address.ts (SSRF, pure)
export function isPublicAddress(address: string): boolean;
export function isAllowedTarget(url: URL): boolean;          // protocol http:/https:, port '' | '80' | '443'
```
`isPublicAddress` fails closed: unparseable input → false. A zone id (`%…`) is stripped before parsing. IPv6 is parsed by hand (no node:net), including compressed `::` and embedded dotted IPv4. It returns false for:
- IPv4: 0.0.0.0/8, 10/8, 100.64/10, 127/8, 169.254/16 (including 169.254.169.254), 172.16/12, 192.0.0/24, 192.0.2/24, 192.168/16, 198.18/15, 198.51.100/24, 203.0.113/24, 224/4, 240/4 (including 255.255.255.255).
- IPv6: ::/128, ::1, ::/96 (IPv4-compatible), ::ffff:0:0/96 (IPv4-mapped, in dotted or hex form, e.g. ::ffff:7f00:1, judged by the embedded v4), 64:ff9b::/96 and 64:ff9b:1::/48 (NAT64), 100::/64, 2001:db8::/32, 2002::/16 (6to4), fc00::/7, fe80::/10, ff00::/8.

Anything else that parses is true.

```ts
// status.ts
export function errorForStatus(status: number): RecipeImportError | null; // 2xx → null; 404/410 not-found; 401/403/429 blocked; else unreachable

// json-ld.ts
export type RecipeJsonLd = Readonly<Record<string, unknown>>;
export function findRecipeJsonLd(html: string): Result<RecipeJsonLd, 'not-a-recipe'>;
// recipe-schema.ts
export const PARSER_VERSION = 1;
export type RecipeContent = Omit<ParsedRecipe, 'recipeId' | 'sourceUrl'>;
export function parseRecipeJsonLd(node: RecipeJsonLd): Result<RecipeContent, 'incomplete-recipe'>; // no title, no ingredients or no steps → incomplete-recipe
export function parseRecipePage(html: string): Result<{ readonly content: RecipeContent; readonly jsonLd: RecipeJsonLd }, 'not-a-recipe' | 'incomplete-recipe'>;
```
`findRecipeJsonLd` reads every `<script type="application/ld+json">` block (attribute order and case are free) and skips malformed ones. It returns the first node whose `@type` is `Recipe` or a list containing `Recipe`, searching in this order: the top-level object, a top-level array, `@graph`, and one level of `mainEntity` on any of those nodes.

`parseRecipeJsonLd` resolves values from the Recipe node alone:
- `image` is a string, an ImageObject `url`, or the first resolvable entry of a list. A bare `{ "@id": … }` reference gives null.
- `yield` is a string, a number (`'4'`) or a list. For a list, the first entry that is not purely numeric wins, otherwise the first entry.
- `recipeInstructions` is a string (split on newlines), a list of strings, `HowToStep.text`, or nested `HowToSection.itemListElement`, flattened.
- HTML entities are decoded and tags are stripped in the title, steps and lines.
- There is no site-specific code.

Invariant: `parseRecipeJsonLd(parseRecipePage(html).jsonLd)` equals `.content` (74.3 AC#3). ISO 8601 durations are not part of `ParsedRecipe` (decision-15's field list) and stay in the raw JSON-LD.

## 10. Server: `packages/providers-server/src/recipe/` (impure)
```ts
// fetch-page.ts
export type FetchedPage = { readonly kind: 'page'; readonly html: string } | { readonly kind: 'failed'; readonly error: RecipeImportError };
export type FetchPage = (normalisedUrl: string) => Promise<FetchedPage>;
export type ResolveHost = (host: string) => Promise<readonly { readonly address: string; readonly family: 4 | 6 }[]>;
/** A node:net LookupFunction that resolves with `resolve` and errors (code 'EBLOCKED') unless every address isPublicAddress; it hands the checked address to the socket, so the connection goes to the address that was checked. */
export function createGuardedLookup(resolve: ResolveHost): import('node:net').LookupFunction;
export interface RawResponse { readonly status: number; readonly headers: Readonly<Record<string, string>>; readonly body: AsyncIterable<Uint8Array>; }
export type Transport = (url: URL, init: { readonly headers: Readonly<Record<string, string>>; readonly signal: AbortSignal; readonly lookup: import('node:net').LookupFunction }) => Promise<RawResponse>;
export interface LiveFetchOptions {
  readonly transport?: Transport;   // default: node:http/https request({ lookup, agent: false, headers, signal }), no automatic redirects
  readonly resolve?: ResolveHost;   // default: node:dns/promises lookup(host, { all: true })
  readonly timeoutMs?: number;      // 10_000, one deadline across all hops (a single AbortSignal)
  readonly maxBytes?: number;       // 5 * 1024 * 1024
  readonly maxRedirects?: number;   // 5
}
export function createLiveFetchPage(options?: LiveFetchOptions): FetchPage;
```
Behaviour of the fetcher on every hop:
- Hop limits and refusals:
  - The target must pass `isAllowedTarget`.
  - An IP-literal host must pass `isPublicAddress`. Node skips lookup for IP literals, so it is checked directly.
  - The connection uses the guarded lookup. This is the DNS-rebinding defence: the address checked is the address connected to.
  - A 3xx with a `Location` header is followed manually, at most `maxRedirects` times.
- Every refusal → `unreachable`.
- Headers: browser-like User-Agent, Accept and Accept-Language. No Cookie or Authorization header.
- Status mapping goes through `errorForStatus`.
- A Content-Type that is not text/html or application/xhtml+xml → `not-a-recipe`, and the body is not read.
- A body over `maxBytes` → `unreachable`.
- Decoding uses TextDecoder with the charset from Content-Type, falling back to utf-8. An unknown label also falls back to utf-8.
- The fetcher never throws. Every failure maps to an error kind.

```ts
// recipe-key.ts
export function recipeKey(normalisedUrl: string): string; // sha256 hex via node:crypto

// recipe-cache.ts
export interface CachedRecipe { readonly url: string; readonly recipe: ParsedRecipe; readonly parserVersion: number; readonly fetchedAt: number; }
export interface CachedSource { readonly url: string; readonly jsonLd: RecipeJsonLd; readonly fetchedAt: number; }
export interface CachedFailure { readonly error: RecipeImportError; readonly failedAt: number; }
export interface RecipeCache {
  getRecipe(key: string): Promise<CachedRecipe | null>;   // a doc that fails to decode → null (a miss), never thrown
  getSource(key: string): Promise<CachedSource | null>;
  getFailure(key: string): Promise<CachedFailure | null>; // a doc that fails to decode → null
  /** Writes recipes/{key} and recipeSources/{key}, and deletes recipeFailures/{key}, in one batch. */
  saveRecipe(key: string, recipe: CachedRecipe, source: CachedSource): Promise<void>;
  saveFailure(key: string, failure: CachedFailure): Promise<void>;
}
// firestore-recipe-cache.ts
export class FirestoreRecipeCache implements RecipeCache { constructor(db: Firestore); } // firebase-admin

// import-recipe.ts
export const FAILURE_MEMORY_MS = 24 * 60 * 60 * 1000;
export interface RecipeImportDeps { readonly fetchPage: FetchPage; readonly cache: RecipeCache; readonly now: () => number; }
export function importRecipe(url: string, deps: RecipeImportDeps): Promise<Result<ParsedRecipe, RecipeImportError>>;
```
`importRecipe` runs in this order:
1. normalise (`invalid-url` stops here, with no cache write)
2. key
3. cached recipe → return it
4. failure with `now - failedAt < FAILURE_MEMORY_MS` → return its error
5. fetchPage
6. parseRecipePage
7. on success: `{...content, recipeId: key, sourceUrl: normalised}`, then saveRecipe (which deletes the failure), then return
8. on any failure: saveFailure, then return err

The function never throws with URL text and never logs a URL or content.

Exports from `packages/providers-server/src/index.ts`: `importRecipe` (also re-exported as the alias `importRecipeOnServer` for the callable), `createLiveFetchPage`, `createGuardedLookup`, `FirestoreRecipeCache`, `recipeKey`, `normaliseRecipeUrl`, `PARSER_VERSION`, `parseRecipeJsonLd`, `FAILURE_MEMORY_MS`, and the types above. Deep imports are forbidden (package-entry-only).

## 11. Server cache documents (Admin SDK only; every client read and write is denied by default)
```
recipes/{key}         { schemaVersion: 1, url: string, recipe: ParsedRecipe, parserVersion: number, fetchedAt: number }
recipeSources/{key}   { schemaVersion: 1, url: string, jsonLd: string /* JSON.stringify of the raw Recipe node */, fetchedAt: number }
recipeFailures/{key}  { schemaVersion: 1, error: RecipeImportError, failedAt: number }
key = sha256 hex of normaliseRecipeUrl(url)
```
`jsonLd` is stored as a JSON string. That departs from decision-15's "the raw Recipe JSON-LD object" because Firestore cannot hold nested arrays, and recipeInstructions sections nest them. providers-recipe-cache records the deviation on TASK-74.4.

firestore.rules gets **no** match block for these collections. Following the inviteCodes precedent (firestore.rules.test.ts:123), default deny is the rule, and the deny tests prove it. A comment in firestore.rules names the three collections and decision-15.

## 12. Functions callable (`apps/functions/src/index.ts`)
```ts
export const importRecipe = onCall(async (request) => {
  requireUid(request);
  const url = requireString(request.data, 'url');
  return importRecipeOnServer(url, { fetchPage: createLiveFetchPage(), cache: new FirestoreRecipeCache(getFirestore()), now: Date.now });
}); // request {url: string}; response = Result<ParsedRecipe, RecipeImportError> as plain data
```
Unauthenticated → `HttpsError('unauthenticated')`. A missing or non-string url → `invalid-argument`. Error kinds come back as data, never as thrown errors. Logging is by error kind only.

## 13. Firebase client provider (`packages/providers-firebase/src/recipe-importer.ts`)
```ts
export class FirebaseRecipeImporter implements RecipeImporter {
  constructor(fns: FunctionsFns, functionsInstance: unknown);
  importRecipe(url: string): Promise<Result<ParsedRecipe, RecipeImportError>>; // httpsCallable<{url:string}, Result<...>>(instance, 'importRecipe')({url}).data
}
```
Exported from `providers-firebase/src/index.ts`. Its emulator test seeds cache docs through Admin `writeRaw`. Each seeded doc has `schemaVersion: 1`, and a seeded failure uses `failedAt: Date.now()`. The key is computed in the test with node:crypto sha256 over the already-normalised `https://recipe.invalid/<path>` URL. The test imports nothing from providers-server.

## 14. Memory provider (demo build, decision-12)
- `MemorySyncStore` gains `mergeRecipe`, `getRecipes` and `watchRecipes` (Group A). Recipes are held in a third Map keyed `${kitchenId}/${id}`. Watchers are filtered by kitchen only and notified via queueMicrotask.
- `export class MemoryRecipeImporter implements RecipeImporter { constructor(entries?: Iterable<readonly [string, ParsedRecipe | RecipeImportError]>) }` follows the fake's outcome rules. It lives in `memory-recipe-importer.ts` and is exported from `providers-memory/src/index.ts`.

## 15. Kitchen recipe documents and rules
- Path: `kitchens/{kitchenId}/recipes/{recipeId}`, shaped as RecipeDoc (§3).
- `FirestoreSyncStore` uses `fs.doc(db,'kitchens',k,'recipes',id)`. Writes run in a transaction: decodeRecipe, then mergeRecipe, then encodeRecipe. Reads use `fs.query(fs.collection(db,'kitchens',k,'recipes'))` with no where clause.
- The kitchen subcollection rule `match /{collection}/{document=**}` is unchanged. Allow and deny tests for `recipes` are added (R49).

## 16. UI (packages/ui; presentational)
```ts
// templates/RecipeTemplate.tsx — RECIPETEMPLATE_STATES = ['rest', 'noYield', 'long']
export interface RecipeTemplateProps {
  title: string;
  yieldLabel: string | null;
  sourceLabel: string;              // hostname
  ingredients: readonly string[];   // lines as written
  steps: readonly string[];
  onBack?: () => void;
}
// templates/MealFormTemplate.tsx — added props
onImportRecipe?: () => void;   // shows the 'Get recipe and groceries' action when set
importing?: boolean;           // action shows a busy label, disabled
importError?: string;          // message under the link field
recipeTitle?: string;          // when the meal's link matches a saved recipe
onOpenRecipe?: () => void;     // 'View recipe' action shown with recipeTitle
// MEALFORMTEMPLATE_STATES gains 'importing', 'importError', 'withRecipe'
```
design/reference/RecipeImport.dc.html is deleted by orch-retire-recipe-board (R66; decision-16 supersedes its ticking and scaling). No naming workaround is needed.

## 17. App (apps/mobile)
- `App` gains `watchKitchenRecipes(kitchenId, onRecipes, onError?): Unsubscribe`, delegating to the application query.
- Each composition supplies `recipeImporter` (Group B):
  - compose-firebase uses `new FirebaseRecipeImporter(firebase.functions.fns, firebase.functions.instance)`.
  - compose-demo uses `MemoryRecipeImporter`, with demo recipes from `src/demo/recipes.ts` keyed by the demo meals' links.
  - `appOnFakes` takes `recipeImporter?: FakeRecipeImporter` (default `new FakeRecipeImporter()`), passes it into ports and returns it, the same way it takes `syncStore` and `kitchens`.
- Route `app/recipe.tsx?dayId&mealId` shows `src/screens/RecipeScreen.tsx`. It reads through watchKitchenRecipes and recipeForLink, and never dispatches ImportRecipe. navigate.ts gains `recipe(dayId, mealId)`.
- AddMealScreen import flow:
  1. A blank name shows the existing empty-name message, and no import starts.
  2. For a new meal, dispatch AddMeal with the current name and link. The mealId from MealAdded is kept in screen state, and from then on the screen edits that meal, even if the import fails. A retry or Save never creates a second meal.
  3. For an existing meal, dispatch EditMeal with the current name and link first.
  4. Dispatch ImportRecipe. On err, show the message from the table below and add nothing.
  5. On ok, set the link field to `event.sourceUrl`, dispatch one AddItem per groceries line in order (amount omitted when null, mealId set, weekId the meal's week), then `go.recipe(dayId, mealId)`.
  6. If an AddItem fails, the loop stops and the screen shows the 'other' message. This is known behaviour, recorded in the notes.
- Error messages, keyed by code:

| Code | Message |
|---|---|
| invalid-url | That doesn't look like a web link. |
| not-found | That page doesn't exist any more. |
| blocked | That site needs a login or blocked us, so we can't read it. |
| unreachable | We couldn't reach that site. Try again tomorrow. |
| not-a-recipe | We couldn't find a recipe on that page. |
| incomplete-recipe | That recipe is missing its ingredients or steps. |
| recipe-deleted | That recipe was removed from this kitchen. |
| other | Something went wrong importing that recipe. |

## 18. Deliberate deviations from decision-3 (recorded in slice notes)
- tools/, firebase/, design/ and board edits are orchestrator work (TASK-10.7 precedent).
- Groups A and B are committed by the orchestrator (c4db885 precedent, §0.7).
- The server-only pure/ tasks, the fixtures and the presentational ui templates start before the ports contract is reviewed, because none of them depends on a port.
- application-import-recipe lands after app-compose-recipes, because Deps.recipeImporter cannot be required until every app composition supplies it.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Sized 8 on 2026-11-06. It spans every layer (core, ports, a new server-only package, providers-server, functions, firebase rules, providers-firebase, ui, app), adds a new kind of kitchen data with its own schema, merge and security rules, and has one open design question. Parsing is predictable; the spread comes from the kitchen-data change and the app flow. Split before committing.

Local testing (Bruk, 2026-11-06): no separate fixture server. The import function runs in the Functions emulator and is used for local testing; parsing is unit-tested against saved pages.

Proposed split, in order (kept small at Bruk's request):
1. design, size-1: record the server-side decision (Cloud Function, shared Firestore cache, raw JSON-LD kept separately, 1-day failure memory, and where the server-only parsing package sits in the layers with the import rule that keeps it out of the apps).
2. design, size-2: where an imported recipe lives in kitchen data and how its ingredients become grocery Items.
3. task, size-3: server-only parsing - schema.org Recipe JSON-LD to a parsed recipe, including each ingredient line's quantity, unit and item, with saved pages from at least five sites as fixtures. Depends on 1.
4. task, size-5: server import - the apps/functions callable, fetcher, cache and failure memory, rules and emulator tests, runnable through pnpm emulators. Depends on 1 and 3.
5. task, size-5: app flow - the app's import port and its client for the function, paste a link, save the recipe to the kitchen, add its ingredients to the grocery list. Depends on 2 and 4.

Going live depends on the separate infrastructure intent "Grocs' Firebase project and deploys are code" (captured 2026-11-06): child 4 can be built and tested against the emulators without it, but this intent cannot close until the import function deploys from code.

Order (Bruk, 2026-11-06): prove it locally first - parsing, the import function in the Functions emulator, and the app's client code - before the deployment work in the infrastructure intent.

Split on 2026-11-06 into TASK-74.1 to TASK-74.5, following the proposed split above. TASK-74.1 and TASK-74.2 can start now; TASK-74.3 waits on 74.1, TASK-74.4 on 74.1 and 74.3, TASK-74.5 on 74.2 and 74.4.

Split into 40 leaf tasks on 2026-11-07 (orchestrator, from a map, draft, three-critic and revise workflow). The slice contract is this task's plan and is frozen once reviewed. Bruk's calls on 2026-11-07: (1) integration groups A (SyncStore widening, TASK-74.7.4-74.7.8) and B (Deps widening, TASK-74.5.10-74.5.12) are built in one shared worktree without builder commits, and the orchestrator commits once green - a recorded deviation from decision-3 and CLAUDE.md, precedent c4db885; (2) a delete wins over re-import (R20): importing a deleted recipe's link returns recipe-deleted, overriding decision-16's restore consequence; (3) commit locally only, no pushes or CI runs - TASK-74.5.8 (visual baselines) waits for Bruk to push; (4) run to a checkpoint after the server side and recipe storage, then the app side.

Contract amended 2026-11-07 (orchestrator, decision-3 mediation): section 9 step 4 strips every trailing slash, not one, so normaliseRecipeUrl stays idempotent for paths like '//'. The code fix is the size-1 bug under TASK-74.4.
<!-- SECTION:NOTES:END -->
