// Generates the 18 layer-agent definitions (decision-3: 6 layers x 3 roles) from one
// template and six layer configs. Pure data in, data out; the CLI entry at the bottom
// is the only part that touches the filesystem.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { agentName, ROLES, ROLE_SPECS, type Role } from './roles.ts';
import { LAYERS, type Layer } from './layers.ts';

export interface LayerConfig {
  readonly layer: Layer;
  readonly summary: string;
  readonly paths: readonly string[];
  readonly testCommand: string;
  readonly typecheckCommand: string;
  /** Further commands this layer's agents may run, such as a renderer for visual checks. */
  readonly extraCommands?: readonly string[];
  readonly rulesFiles: readonly string[];
  readonly exampleFiles: readonly string[];
}

export interface GeneratedFile {
  readonly path: string;
  readonly content: string;
}

function rulesSection(config: LayerConfig): string {
  if (config.rulesFiles.length === 0) return '';
  const list = config.rulesFiles.map((f) => `- \`${f}\``).join('\n');
  return `## Rules\n\nAlso read these path-scoped rules before writing:\n${list}\n\n`;
}

export function renderDefinition(template: string, role: Role, config: LayerConfig): string {
  const spec = ROLE_SPECS[role];
  const name = agentName(role, config.layer);
  const replacements: Record<string, string> = {
    NAME: name,
    DESCRIPTION: spec.descriptionTemplate.replace(/\{layer\}/g, config.layer),
    TOOLS: spec.tools.join(', '),
    DISALLOWED_TOOLS: spec.disallowedTools.join(', '),
    MODEL: spec.model,
    EFFORT_LINE: spec.effort ? `effort: ${spec.effort}\n` : '',
    LAYER: config.layer,
    SUMMARY: config.summary,
    PATHS: config.paths.map((p) => `- \`${p}\``).join('\n'),
    TEST_COMMAND: config.testCommand,
    TYPECHECK_COMMAND: config.typecheckCommand,
    EXTRA_COMMANDS: (config.extraCommands ?? []).map((c) => `\n- \`${c}\``).join(''),
    RULES_SECTION: rulesSection(config),
    EXAMPLES: config.exampleFiles.map((f) => `- \`${f}\``).join('\n'),
    ROLE_BODY: spec.bodyFragment,
  };
  let out = template;
  for (const [token, value] of Object.entries(replacements)) {
    out = out.split(`{{${token}}}`).join(value);
  }
  return out.replace(/\n{3,}/g, '\n\n');
}

export function definitionPath(role: Role, layer: Layer): string {
  return `.claude/agents/${agentName(role, layer)}.md`;
}

export function buildDefinitions(template: string, configs: readonly LayerConfig[]): GeneratedFile[] {
  const out: GeneratedFile[] = [];
  for (const config of configs) {
    for (const role of ROLES) {
      out.push({ path: definitionPath(role, config.layer), content: renderDefinition(template, role, config) });
    }
  }
  return out;
}

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');

export function loadConfigs(): LayerConfig[] {
  return LAYERS.map((layer) => JSON.parse(readFileSync(resolve(here, 'configs', `${layer}.json`), 'utf8')) as LayerConfig);
}

export function loadTemplate(): string {
  return readFileSync(resolve(here, 'template.md'), 'utf8');
}

function main(): void {
  const definitions = buildDefinitions(loadTemplate(), loadConfigs());
  for (const def of definitions) writeFileSync(resolve(root, def.path), def.content);
  console.log(`generated ${definitions.length} agent definitions under .claude/agents/`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
