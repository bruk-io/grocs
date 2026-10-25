// Unit tests for the agent-launch guard (decision-3). `decide` takes its Deps as a
// parameter, so these never shell out to a real `backlog` or the philosophy plugin:
// CI has neither, and a fake board is also the only way to construct every case
// (a mismatched layer, model or size, and a size-1 task missing its numbered steps).
import { describe, expect, it } from 'vitest';
import { decide, numberedSteps, type Deps, type TaskInfo } from './launch-guard.ts';

const ROOT = '/repo';

function deps(task: TaskInfo | null, model: string | null): Deps {
  return {
    readTask: () => task,
    readRoute: () => (model ? { model } : null),
  };
}

const coreLayerTask: TaskInfo = { labels: ['layer-core', 'size-3'], plan: '### Order of work\n\n1. Do it.\n' };

describe('launch guard: scope (decision-3 governs only the 18 layer agents)', () => {
  it('ignores anything that is not an Agent tool call', () => {
    expect(decide({ tool_name: 'Edit' }, ROOT, deps(null, null)).decision).toBe('allow');
  });

  it('ignores a launch whose subagent_type names no generated layer agent', () => {
    const payload = { tool_name: 'Agent', tool_input: { subagent_type: 'general-purpose', prompt: 'no task here' } };
    expect(decide(payload, ROOT, deps(null, null)).decision).toBe('allow');
  });
});

describe('launch guard: a gated launch (decision-3)', () => {
  it('denies a layer-agent launch whose brief names no task', () => {
    const payload = { tool_name: 'Agent', tool_input: { subagent_type: 'builder-core', prompt: 'go build the thing' } };
    const r = decide(payload, ROOT, deps(coreLayerTask, 'sonnet'));
    expect(r.decision).toBe('deny');
    expect(r.reason).toContain('launch-guard/no-task');
  });

  it('denies when the task cannot be read', () => {
    const payload = { tool_name: 'Agent', tool_input: { subagent_type: 'builder-core', prompt: 'work on TASK-1.99' } };
    const r = decide(payload, ROOT, deps(null, 'sonnet'));
    expect(r.decision).toBe('deny');
    expect(r.reason).toContain('launch-guard/unreadable-task');
  });

  it('denies a mismatched layer, naming the reason', () => {
    const payload = { tool_name: 'Agent', tool_input: { subagent_type: 'builder-ports', prompt: 'work on TASK-1.21' } };
    const r = decide(payload, ROOT, deps(coreLayerTask, 'sonnet'));
    expect(r.decision).toBe('deny');
    expect(r.reason).toContain('launch-guard/layer-mismatch');
    expect(r.reason).toContain('layer-core');
  });

  it('denies a mismatched model, naming the reason', () => {
    const payload = { tool_name: 'Agent', tool_input: { subagent_type: 'builder-core', prompt: 'work on TASK-1.21' } };
    const r = decide(payload, ROOT, deps(coreLayerTask, 'opus'));
    expect(r.decision).toBe('deny');
    expect(r.reason).toContain('launch-guard/model-mismatch');
  });

  it('denies when the route cannot be read', () => {
    const payload = { tool_name: 'Agent', tool_input: { subagent_type: 'builder-core', prompt: 'work on TASK-1.21' } };
    const r = decide(payload, ROOT, deps(coreLayerTask, null));
    expect(r.decision).toBe('deny');
    expect(r.reason).toContain('launch-guard/unreadable-route');
  });

  it('denies a mismatched size: a size-1 task routed to a non-small builder', () => {
    const size1NoSteps: TaskInfo = { labels: ['layer-core', 'size-1'], plan: '### Order of work\n\nDo the thing, no numbers.\n' };
    const payload = { tool_name: 'Agent', tool_input: { subagent_type: 'builder-core', prompt: 'work on TASK-1.1' } };
    // board-check routes size-1 to haiku; a plain builder is pinned to sonnet, so this is also a model mismatch
    const r = decide(payload, ROOT, deps(size1NoSteps, 'haiku'));
    expect(r.decision).toBe('deny');
    expect(r.reason).toContain('launch-guard/model-mismatch');
  });

  it('denies a size-1 task with no numbered steps, even when routed correctly', () => {
    const size1NoSteps: TaskInfo = { labels: ['layer-core', 'size-1'], plan: '### Order of work\n\nDo the thing, no numbers.\n' };
    const payload = { tool_name: 'Agent', tool_input: { subagent_type: 'builder-core-small', prompt: 'work on TASK-1.1' } };
    const r = decide(payload, ROOT, deps(size1NoSteps, 'haiku'));
    expect(r.decision).toBe('deny');
    expect(r.reason).toContain('launch-guard/no-numbered-steps');
  });

  it('allows a matching launch: right layer, right model, size-1 with numbered steps', () => {
    const size1: TaskInfo = { labels: ['layer-core', 'size-1'], plan: '### Order of work\n\n1. Do the thing.\n2. Verify it.\n' };
    const payload = { tool_name: 'Agent', tool_input: { subagent_type: 'builder-core-small', prompt: 'work on TASK-1.1' } };
    expect(decide(payload, ROOT, deps(size1, 'haiku')).decision).toBe('allow');
  });

  it('allows a matching size 2-5 launch with no numbered-step requirement', () => {
    const payload = { tool_name: 'Agent', tool_input: { subagent_type: 'builder-core', prompt: 'work on TASK-1.21' } };
    expect(decide(payload, ROOT, deps(coreLayerTask, 'sonnet')).decision).toBe('allow');
  });

  it('allows a reviewer launch even when the route (a builder question) disagrees with the reviewer\'s pinned model', () => {
    // board-check route only ever answers ORCHESTRATE/LEAF/SMALL_LEAF; it has no reviewer entry
    // to agree or disagree with (ROLE_SPECS.reviewer.routeTableCovers is false), so a route that
    // would fail a builder's model check must not fail a reviewer's launch.
    const payload = { tool_name: 'Agent', tool_input: { subagent_type: 'reviewer-core', prompt: 'review TASK-1.21' } };
    expect(decide(payload, ROOT, deps(coreLayerTask, 'sonnet')).decision).toBe('allow');
  });

  it('allows a reviewer launch even when the route cannot be read at all', () => {
    const payload = { tool_name: 'Agent', tool_input: { subagent_type: 'reviewer-core', prompt: 'review TASK-1.21' } };
    expect(decide(payload, ROOT, deps(coreLayerTask, null)).decision).toBe('allow');
  });

  it('still denies a reviewer launch on a layer mismatch', () => {
    const payload = { tool_name: 'Agent', tool_input: { subagent_type: 'reviewer-ports', prompt: 'review TASK-1.21' } };
    const r = decide(payload, ROOT, deps(coreLayerTask, null));
    expect(r.decision).toBe('deny');
    expect(r.reason).toContain('launch-guard/layer-mismatch');
  });
});

describe('numberedSteps', () => {
  it('counts numbered lines under "### Order of work" only', () => {
    const plan = '### Order of work\n\n1. First.\n2. Second.\n\n### Risks\n\n1. Not counted.\n';
    expect(numberedSteps(plan)).toBe(2);
  });

  it('is zero when the section has no numbered lines', () => {
    expect(numberedSteps('### Order of work\n\nJust prose.\n')).toBe(0);
  });

  it('is zero when the plan has no "### Order of work" heading at all', () => {
    expect(numberedSteps('1. Looks numbered but is not under the right heading.\n')).toBe(0);
  });

  it('counts to the end of the plan when "### Order of work" is its last section', () => {
    expect(numberedSteps('### Order of work\n\n1. Only step.\n')).toBe(1);
  });
});
