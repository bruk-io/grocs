// The three roles decision-3 generates per layer, and the route values this repo
// checks them against. The plugin's own route table lives outside this repo (a local
// plugin-cache path CI cannot read), so the values are mirrored here once, each with
// where it was read, and the agent-definitions check compares committed definitions
// against this mirror rather than shelling out to the plugin at check time.
export type Role = 'builder' | 'builder-small' | 'reviewer';

export const ROLES: readonly Role[] = ['builder', 'builder-small', 'reviewer'];

export interface RoleSpec {
  /** The name suffix after the layer: builder-<layer>, builder-<layer>-small, reviewer-<layer>. */
  readonly suffix: '' | '-small';
  readonly prefix: 'builder' | 'reviewer';
  readonly model: 'sonnet' | 'haiku' | 'opus';
  /** Omitted means no `effort:` line in the generated frontmatter (the session default). */
  readonly effort?: 'medium' | 'high';
  readonly tools: readonly string[];
  readonly disallowedTools: readonly string[];
  /** Whether board.py's route() has a value for this role, and the check's wording when it doesn't. */
  readonly routeTableCovers: boolean;
  /** `{layer}` is replaced with the layer name when the template is filled in. */
  readonly descriptionTemplate: string;
  readonly bodyFragment: string;
}

/**
 * Mirrors philosophy plugin 0.4.6's `board.py` (scripts/board.py:58-60), read on 2026-10-18:
 *   ORCHESTRATE = Route("opus", "high", ...)
 *   LEAF        = Route("sonnet", "medium", ...)
 *   SMALL_LEAF  = Route("haiku", None, ...)   -- None means "the default effort", not "unset is required"
 * If the plugin's route table changes, this mirror must be updated by hand: a repo-local
 * check cannot see a path under ~/.claude/plugins/cache, which does not exist in CI.
 */
export const ROUTE_TABLE_MIRROR = {
  LEAF: { model: 'sonnet', effort: 'medium' as const },
  SMALL_LEAF: { model: 'haiku', effort: undefined as 'medium' | 'high' | undefined },
  ORCHESTRATE: { model: 'opus', effort: 'high' as const },
} as const;

/**
 * Transcribed from decision-3's own Decision table (lines 23-29), independent of
 * ROLE_SPECS below, so the generator's actual pins can be compared against what the
 * decision record says rather than against themselves.
 */
export const DECISION_3_TABLE: Readonly<Record<Role, { model: string; effort?: 'medium' | 'high' }>> = {
  builder: { model: 'sonnet', effort: 'medium' },
  'builder-small': { model: 'haiku', effort: 'high' },
  reviewer: { model: 'opus', effort: 'high' },
};

export const ROLE_SPECS: Readonly<Record<Role, RoleSpec>> = {
  builder: {
    suffix: '',
    prefix: 'builder',
    model: ROUTE_TABLE_MIRROR.LEAF.model,
    effort: ROUTE_TABLE_MIRROR.LEAF.effort,
    tools: ['Read', 'Grep', 'Glob', 'Write', 'Edit', 'Bash'],
    disallowedTools: ['Agent'],
    routeTableCovers: true,
    descriptionTemplate:
      'Use for a {layer}-layer task sized 2 to 5: plans, builds, checks and fixes within the {layer} layer, including bug tasks routed back to it.',
    bodyFragment:
      'Plan with `philosophy:plan-change` before editing, build, run this layer\'s own checks, and fix what they find. A later `bug` task against this layer routes back to you the same way.',
  },
  'builder-small': {
    suffix: '-small',
    prefix: 'builder',
    model: ROUTE_TABLE_MIRROR.SMALL_LEAF.model,
    // decision-3 pins "high" where board.py's SMALL_LEAF leaves effort at the default,
    // because haiku is weaker than sonnet on long agentic work (decision-3 Consequences);
    // specialising an unset value is not a disagreement with the route table.
    effort: 'high',
    tools: ['Read', 'Grep', 'Glob', 'Write', 'Edit', 'Bash'],
    disallowedTools: ['Agent'],
    routeTableCovers: true,
    descriptionTemplate:
      'Use for a {layer}-layer task sized 1, with numbered steps already written into its plan: follows those steps exactly within the {layer} layer.',
    bodyFragment:
      'Follow the numbered steps in the task\'s plan exactly, in order. If the task turns out bigger than its steps, stop and propose a split rather than pushing through.',
  },
  reviewer: {
    suffix: '',
    prefix: 'reviewer',
    model: ROUTE_TABLE_MIRROR.ORCHESTRATE.model,
    effort: ROUTE_TABLE_MIRROR.ORCHESTRATE.effort,
    tools: ['Read', 'Grep', 'Glob', 'Bash'],
    disallowedTools: ['Agent', 'Write', 'Edit'],
    // board.py's route() only ever returns ORCHESTRATE, LEAF or SMALL_LEAF for a task by
    // size/type; it has no notion of a reviewer role. There is no plugin value to agree
    // or disagree with, so the check compares reviewers against decision-3's table only.
    routeTableCovers: false,
    descriptionTemplate: 'Use to review a {layer}-layer change against its rules and examples. Writes nothing; reports what to change and why.',
    bodyFragment:
      'Review the diff against this layer\'s rules and examples. Report what to change and why, citing the rule. You have no Write or Edit tool: you report, you do not fix.',
  },
};

export function agentName(role: Role, layer: string): string {
  const spec = ROLE_SPECS[role];
  return `${spec.prefix}-${layer}${spec.suffix}`;
}
