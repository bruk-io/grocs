---
paths:
  - "tools/**"
  - "lefthook.yml"
  - ".github/**"
  - ".claude/**"
  - "vitest.config.ts"
---

# When a check fails, fix the code, not the check

Applies when a check, hook or test fails, and when editing the checks themselves.

If a check, hook or test fails, change the code under test. If you believe the check itself is
wrong (a false positive, a rule that no longer fits), stop and tell the person who owns the spec,
with the failing message and your reason. Do not edit the check, its config, its tests or its
exclusions to get a green run.

Why: a check that the thing it checks can edit proves nothing (R57). Hooks block the obvious
weakenings, but they cannot judge whether a narrower pattern is a fix or a loophole, so that
call stays with a person.

A change that makes a check stricter, or adds one, is welcome. Every failure message must name
the rule and say why it exists (R55); a rule without a reason is not finished.
