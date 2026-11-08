---
paths:
  - "packages/providers-*/**"
---

# Providers translate; they do not decide

Applies when writing or changing a provider.

A provider maps a port onto an SDK: converting shapes, calling the SDK, mapping its errors. If
you are deciding what an item is, how two changes merge, which one wins, or what is personal data,
that logic belongs in `packages/core`, where both apps share it and unit tests reach it without a
backend. Pass the result in as data.

Why: the two apps must not drift apart (R25), and a rule inside a provider is only tested by
running the emulators. Where the line falls between translating and deciding is a judgement.

## The one exception: `packages/providers-server/src/recipe/pure/` (decision-15)

The recipe parsing (schema.org JSON-LD to a parsed recipe, ingredient lines, URL normalisation,
the SSRF address check) lives in `packages/providers-server/src/recipe/pure/` on purpose. It is
server-only: the apps never run it, so R25's reason, that two apps must not drift apart, does not
apply. It is still held to the domain's standard by checks: `core-purity` (no clock, randomness or
ambient I/O), `import-layers/pure-folder` (only `@grocs/core` and files inside `pure/`) and
`test-presence/domain-unit-test` (a unit test beside every module). Everything impure, such as
fetching, caching and hashing, goes in `packages/providers-server/src/recipe/` outside `pure/`.
