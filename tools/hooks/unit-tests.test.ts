import { describe, expect, it } from 'vitest';
import { isBoardOnly } from './unit-tests.ts';

describe('isBoardOnly (lefthook.yml: skip unit tests for a pure board change)', () => {
  it('is true when every staged file is under backlog/', () => {
    expect(isBoardOnly(['backlog/tasks/task-1.md', 'backlog/drafts/draft-2.md'])).toBe(true);
  });

  it('is false when any staged file is outside backlog/', () => {
    expect(isBoardOnly(['backlog/tasks/task-1.md', 'packages/core/src/a.ts'])).toBe(false);
  });

  it('is false with no staged files at all - nothing to skip tests for', () => {
    expect(isBoardOnly([])).toBe(false);
  });

  it('is false for a path that merely starts with "backlog" without the slash', () => {
    expect(isBoardOnly(['backlog.md'])).toBe(false);
  });
});
