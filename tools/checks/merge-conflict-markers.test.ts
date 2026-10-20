import { describe, expect, it } from 'vitest';
import { check } from './merge-conflict-markers.ts';
import { fixture, message } from './fixture.ts';
import type { CheckContext } from './lib.ts';

describe('merge conflict markers (R57)', () => {
  it('flags a real conflict block, naming the file and the opening marker line', () => {
    const findings = check.run(
      fixture({
        'backlog/tasks/task-9.md': 'Status: In Progress\n<<<<<<< HEAD\nold notes\n=======\nnew notes\n>>>>>>> feature\n',
      }),
    );
    expect(findings.map((f) => f.line)).toEqual([2, 4, 6]);
    expect(findings[0]?.file).toBe('backlog/tasks/task-9.md');
  });

  it('flags the diff3 common-ancestor marker too', () => {
    const findings = check.run(fixture({ 'a.ts': '<<<<<<< HEAD\nours\n|||||||\nbase\n=======\ntheirs\n>>>>>>> branch\n' }));
    expect(findings.map((f) => f.line)).toEqual([1, 3, 5, 7]);
  });

  it('sees a board file and an agent config file, which allFiles would skip', () => {
    const findings = check.run(
      fixture({
        'backlog/tasks/task-1.md': '<<<<<<< HEAD\n',
        '.claude/settings.json': '>>>>>>> branch\n',
      }),
    );
    expect(findings.map((f) => f.file).sort()).toEqual(['.claude/settings.json', 'backlog/tasks/task-1.md']);
  });

  it('does not match a run of = that is not exactly seven, or one that is not alone on its line', () => {
    const findings = check.run(
      fixture({
        'a.md': '==========\nfoo ======= bar\nheading\n-------\n',
      }),
    );
    expect(findings).toEqual([]);
  });

  it('does not match a run of < or > longer than seven', () => {
    const findings = check.run(fixture({ 'a.ts': '<<<<<<<< a longer divider\n>>>>>>>> another one\n' }));
    expect(findings).toEqual([]);
  });

  it('passes an ordinary file with none of these lines', () => {
    const findings = check.run(fixture({ 'packages/core/src/a.ts': "export const f = () => 1;\n// nothing odd here\n" }));
    expect(findings).toEqual([]);
  });

  it('skips a tracked path that is not readable right now, an unstaged rename or delete, instead of throwing', () => {
    const ctx: CheckContext = { ...fixture({ 'a.ts': 'fine\n' }), trackedFiles: ['a.ts', 'gone.md'] };
    expect(check.run(ctx)).toEqual([]);
  });

  it('names the rule and why it exists', () => {
    const [f] = check.run(fixture({ 'a.ts': '<<<<<<< HEAD\n' }));
    const text = message(check, f!);
    expect(text).toContain('merge-conflict-markers/marker-left-in-file (R57)');
    expect(text).toContain('Why:');
  });
});
