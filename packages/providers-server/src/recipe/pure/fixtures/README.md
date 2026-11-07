# Recipe page fixtures (TASK-74.3.4)

Fixtures for the JSON-LD reader in `packages/providers-server/src/recipe/pure/` (TASK-74.3
AC#4, TASK-74 AC#12). None of these files is the publisher's full page: each real-site file
keeps only its `application/ld+json` script block(s), unmodified down to each block's
original opening `<script ...>` tag (attributes, order and all), inside a minimal HTML
wrapper (`<!DOCTYPE html><html><head>...<title>...</head><body></body></html>`). The repo is
going public (TASK-10), the pages as captured were hundreds of kilobytes each, and full
publisher pages are not ours to redistribute. Parser coverage is unaffected because the
reader (`findRecipeJsonLd`) reads every `application/ld+json` script block regardless of its
other attributes or attribute order.

Each real-site file keeps *every* ld+json block the page had, not only the one holding the
Recipe node, deliberately: which block (if any) is the Recipe is exactly what
`findRecipeJsonLd` has to find, so `food52.html`'s Recipe being the third of three blocks is
real coverage, not leftover noise. Block counts and byte-for-byte block contents match the raw
captures exactly, including each block's original opening `<script>` tag attributes (see
Implementation Notes on TASK-74.3.4 for the comparison).

## Real-site files

Captured once by the orchestrator on 2026-11-07 between 02:40:55 and 02:40:58 UTC
(2026-11-06 21:40 local), with a fresh `requests.Session` per URL and no cookies
(TASK-74.3.3's capture notes and `capture-log.json`, scratchpad-only). Headers sent were
identical for every capture:

```
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36
Accept-Encoding: gzip, deflate
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Connection: keep-alive
Accept-Language: en-US,en;q=0.9
```

No Cookie header was sent.

| File | Site | Source URL | Capture (UTC) | ld+json blocks kept | Notable shape |
|---|---|---|---|---|---|
| `nyt-cooking.html` | NYT Cooking | https://cooking.nytimes.com/recipes/1015178-marcella-hazans-tomato-sauce | 2026-11-07T02:40:55 | 4 (`Recipe`, `WebPage`, `Organization`, `NewsMediaOrganization`) | Top-level object; `@type` a single string; `recipeYield` a string; `image` a list of `ImageObject`, each with both `url` and `contentUrl` set to the same resolvable address; instructions a flat list of `HowToStep` |
| `serious-eats.html` | Serious Eats | https://www.seriouseats.com/the-best-chili-recipe | 2026-11-07T02:40:56 | 1 | Top-level array containing one Recipe node; `@type` a list (`["Recipe"]`); `image` a single `ImageObject` |
| `allrecipes.html` | Allrecipes | https://www.allrecipes.com/recipe/20144/banana-banana-bread (redirected to the same path with a trailing `/`) | 2026-11-07T02:40:56 | 1 | Top-level array; `@type` a list with more than one entry (`["Recipe","NewsArticle"]`); `recipeYield` a list of strings (`["12","1 (9x5-inch) loaf"]`) |
| `recipetineats.html` | RecipeTin Eats | https://www.recipetineats.com/easy-classic-chinese-beef-stir-fry/ | 2026-11-07T02:40:56 | 2 (`@graph` document, `NewsArticle`) | Recipe node inside a top-level `@graph` array; `@type` is a plain string (`"Recipe"`), not a list; instructions a nested `HowToSection` with `itemListElement`; `image` a list of plain strings |
| `food52.html` | Food52 (the fifth site; see TASK-74.3.3's notes on BBC Good Food) | https://food52.com/recipes/65245-weeknight-chili | 2026-11-07T02:40:58 | 3 (`WebSite`, `Organization`, `Recipe`) | Recipe is the last of several ld+json blocks on the page, none of the earlier ones a Recipe - the only one of the five real pages where the Recipe is not the first block; `image` a bare string URL |

## Hand-made files

The real pages above do not show every shape the reader must handle (TASK-74.3.4 AC#2), so
these six pages are written by hand, each a minimal page with no publisher content:

| File | Covers |
|---|---|
| `hand-main-entity.html` | A Recipe node reached only through a `WebPage`'s `mainEntity` |
| `hand-yield-number.html` | `recipeYield` as a bare JSON number (`4`), not a string or a list |
| `hand-image-bare-id.html` | `image` as a bare `{ "@id": … }` reference with no resolvable URL (must normalise to `null`) |
| `hand-no-json-ld.html` | A page with no `application/ld+json` block at all |
| `hand-malformed-then-valid.html` | A malformed (syntactically invalid) ld+json block followed by a valid Recipe block |
| `hand-no-instructions.html` | A Recipe with ingredients and a yield but no `recipeInstructions` field |

## Scrubbing

Every file here is grepped for `AIza`, `firebaseio.com`, `googleapis` and a line that is
exactly seven `<`, `=`, `|` or `>` characters (merge-conflict markers); none of these strings
appears. No fixture adds a dependency.
