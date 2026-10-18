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
