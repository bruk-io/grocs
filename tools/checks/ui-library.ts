// One component library for every app (R38): the iPhone and the Android phone are built from the same
// packages/ui, organised by atomic design level, and no app keeps components of its own.
import type { Check, CheckContext, Finding, RuleInfo } from './lib.ts';

export const rules: Readonly<Record<string, RuleInfo>> = {
  'ui-library/app-uses-ui-package': {
    req: 'R38',
    summary: 'Every app depends on @grocs/ui',
    why: 'Both phones must look and behave the same from one set of components. An app that does not depend on the shared library is drawing its own.',
    fix: 'Add "@grocs/ui": "workspace:*" to the app\'s package.json dependencies and build its screens from the library.',
  },
  'ui-library/no-app-design-levels': {
    req: 'R38',
    summary: 'Design levels (atoms, molecules, organisms, templates) exist only in packages/ui',
    why: 'A second atoms/ or molecules/ folder is a second component library. Components in an app cannot be seen in Storybook with the others and drift from the tokens.',
    fix: 'Move the component into packages/ui/src/<level>/ with its stories, and import it from @grocs/ui.',
  },
};

const LEVEL_FOLDER = /(^|\/)(atoms|molecules|organisms|templates)\//;

export function run(ctx: CheckContext): Finding[] {
  const out: Finding[] = [];
  for (const file of ctx.allFiles) {
    const app = /^apps\/([^/]+)\/package\.json$/.exec(file);
    if (!app) continue;
    const pkg = JSON.parse(ctx.readSource(file)) as { dependencies?: Record<string, string> };
    if (!pkg.dependencies || !('@grocs/ui' in pkg.dependencies)) {
      out.push({ rule: 'ui-library/app-uses-ui-package', file, detail: `apps/${app[1]} does not list @grocs/ui in dependencies` });
    }
  }
  for (const file of ctx.files) {
    if (/^packages\/ui\//.test(file) || !LEVEL_FOLDER.test(file) || !/^(apps|packages)\//.test(file)) continue;
    out.push({ rule: 'ui-library/no-app-design-levels', file, detail: `${file} sits in a design level folder outside packages/ui` });
  }
  return out;
}

export const check: Check = { id: 'ui-library', rules, run };
