import { describe, expect, it } from 'vitest';
import { fixture, message, rulesOf } from './fixture.ts';
import { check, parseImports } from './import-layers.ts';

const run = (files: Record<string, string>) => check.run(fixture(files));

describe('import layers (R26, R27, R60)', () => {
  it('accepts imports that follow the layer table', () => {
    expect(
      run({
        'packages/core/src/index.ts': 'export const a = 1;',
        'packages/ports/src/index.ts': "import { a } from '@grocs/core'; export const b = a;",
        'packages/application/src/index.ts': "import { b } from '@grocs/ports'; import { a } from '@grocs/core'; export const c = [a, b];",
        'packages/providers-firebase/src/index.ts': "import { b } from '@grocs/ports'; import firestore from 'firebase/firestore'; export { b, firestore };",
        'packages/ui/src/atoms/Button.tsx': "import { View } from 'react-native'; import { tokens } from '../tokens/index.ts'; export const B = View; export { tokens };",
        'packages/ui/src/tokens/index.ts': 'export const tokens = {};',
        'apps/mobile/src/composition/index.ts': "import '@grocs/core'; import '@grocs/ports'; import '@grocs/application'; import '@grocs/providers-firebase'; import '@grocs/ui';",
      }),
    ).toEqual([]);
  });

  it('rejects the domain importing another layer', () => {
    const findings = run({
      'packages/core/src/index.ts': "import { x } from '@grocs/ports'; export { x };",
      'packages/ports/src/index.ts': 'export const x = 1;',
    });
    expect(rulesOf(findings)).toEqual(['import-layers/allowed-imports']);
    expect(findings[0]?.detail).toContain('core may import nothing');
  });

  it('rejects providers importing one another', () => {
    const findings = run({
      'packages/providers-firebase/src/index.ts': "import '@grocs/providers-device';",
      'packages/providers-device/src/index.ts': 'export {};',
    });
    expect(rulesOf(findings)).toEqual(['import-layers/providers-isolated']);
  });

  it('treats providers-memory as a provider: ports and core only, never another provider or the test fakes (decision-12)', () => {
    const ports = { 'packages/ports/src/index.ts': 'export {};', 'packages/core/src/index.ts': 'export {};' };
    expect(run({ ...ports, 'packages/providers-memory/src/index.ts': "import '@grocs/ports'; import '@grocs/core';" })).toEqual([]);
    expect(rulesOf(run({ 'packages/providers-memory/src/index.ts': "import '@grocs/providers-firebase';", 'packages/providers-firebase/src/index.ts': 'export {};' }))).toEqual(['import-layers/providers-isolated']);
    expect(rulesOf(run({ ...ports, 'packages/providers-memory/src/auth.ts': "import { FakeAuth } from '@grocs/ports/testing'; export { FakeAuth };" }))).toEqual(['import-layers/testing-entry-test-only']);
  });

  it('rejects ui importing anything from the project', () => {
    const findings = run({
      'packages/ui/src/atoms/A.tsx': "import { dispatch } from '@grocs/application'; export { dispatch };",
      'packages/application/src/index.ts': 'export const dispatch = 1;',
    });
    expect(rulesOf(findings)).toEqual(['import-layers/ui-tokens-only']);
  });

  it('rejects application importing providers', () => {
    const findings = run({
      'packages/application/src/index.ts': "import '@grocs/providers-firebase';",
      'packages/providers-firebase/src/index.ts': 'export {};',
    });
    expect(rulesOf(findings)).toEqual(['import-layers/allowed-imports']);
  });

  it('rejects I/O and platform packages in the domain, ports and application', () => {
    const findings = run({
      'packages/core/src/a.ts': "import fs from 'node:fs'; export { fs };",
      'packages/ports/src/b.ts': "import { View } from 'react-native'; export { View };",
      'packages/application/src/c.ts': "import axios from 'axios'; export { axios };",
    });
    expect(rulesOf(findings)).toEqual(['import-layers/no-io-packages', 'import-layers/no-io-packages', 'import-layers/no-io-packages']);
  });

  it('lets the ui layer animate with Reanimated (decision-5), and still refuses it in the domain', () => {
    expect(run({ 'packages/ui/src/molecules/M.tsx': "import Animated from 'react-native-reanimated'; export { Animated };" })).toEqual([]);
    expect(rulesOf(run({ 'packages/core/src/a.ts': "import Animated from 'react-native-reanimated'; export { Animated };" }))).toEqual(['import-layers/no-io-packages']);
  });

  it('lets test files in the domain use test tooling', () => {
    expect(run({ 'packages/core/src/a.test.ts': "import { it } from 'vitest'; import fc from 'fast-check'; it('x', () => fc);" })).toEqual([]);
  });

  it('lets Storybook config files use Storybook', () => {
    expect(run({ 'packages/ui/.storybook/main.ts': "import type { StorybookConfig } from '@storybook/react-native-web-vite'; export type C = StorybookConfig;" })).toEqual([]);
    expect(rulesOf(run({ 'packages/ui/src/atoms/A.tsx': "import { x } from '@storybook/react'; export { x };" }))).toEqual(['import-layers/no-io-packages']);
  });

  it('lets only tests import the test-support entry, so fakes stay out of release bundles (R49, R53)', () => {
    const ports = { 'packages/ports/src/index.ts': 'export {};' };
    expect(run({ ...ports, 'packages/application/src/a.test.ts': "import { FakeAuth } from '@grocs/ports/testing'; export { FakeAuth };" })).toEqual([]);
    const findings = run({ ...ports, 'packages/application/src/a.ts': "import { FakeAuth } from '@grocs/ports/testing'; export { FakeAuth };" });
    expect(rulesOf(findings)).toEqual(['import-layers/testing-entry-test-only']);
    expect(message(check, findings[0]!)).toContain('Why: Metro does not drop unused exports');
  });

  it('rejects deep and by-path imports into another package', () => {
    const findings = run({
      'packages/application/src/a.ts': "import '@grocs/ports/src/clock/fake.ts'; import '../../core/src/index.ts';",
      'packages/ports/src/clock/fake.ts': 'export {};',
      'packages/core/src/index.ts': 'export {};',
    });
    expect(rulesOf(findings)).toEqual(['import-layers/package-entry-only', 'import-layers/package-entry-only']);
  });

  it('finds import cycles between files', () => {
    const findings = run({
      'packages/core/src/a.ts': "import './b.ts';",
      'packages/core/src/b.ts': "import './a.ts';",
    });
    expect(rulesOf(findings)).toEqual(['import-layers/no-cycles']);
  });

  it('finds a cycle through package entry points', () => {
    const findings = run({
      'packages/ports/src/index.ts': "import '@grocs/core';",
      'packages/core/src/index.ts': "import '@grocs/ports';",
    });
    expect(rulesOf(findings)).toContain('import-layers/no-cycles');
  });

  it('keeps design levels in order (R60)', () => {
    const findings = run({
      'packages/ui/src/atoms/A.tsx': "import { M } from '../molecules/M.tsx'; export { M };",
      'packages/ui/src/molecules/M.tsx': "import { A } from '../atoms/A.tsx'; export { A };",
    });
    expect(rulesOf(findings)).toContain('import-layers/design-levels');
  });

  it('names the rule and the reason in every failure message', () => {
    const findings = run({
      'packages/core/src/index.ts': "import '@grocs/ports';",
      'packages/ports/src/index.ts': 'export {};',
    });
    const text = message(check, findings[0]!);
    expect(text).toContain('FAIL import-layers/allowed-imports (R26, R27)');
    expect(text).toContain('Why:');
    expect(text).toContain('Fix:');
    expect(text).toContain('packages/core/src/index.ts:1');
  });

  it('every rule has a requirement, a reason and a fix', () => {
    for (const [id, rule] of Object.entries(check.rules)) {
      expect(rule.req, id).toMatch(/R\d+/);
      expect(rule.why.length, id).toBeGreaterThan(40);
      expect(rule.fix.length, id).toBeGreaterThan(20);
    }
  });

  it('reads import, export-from and dynamic import specifiers with line numbers', () => {
    const refs = parseImports("import a from 'a';\nexport * from 'b';\nconst c = await import('c');\nimport type { D } from 'd';");
    expect(refs).toEqual([
      { spec: 'a', line: 1 },
      { spec: 'b', line: 2 },
      { spec: 'c', line: 3 },
      { spec: 'd', line: 4 },
    ]);
  });
});
