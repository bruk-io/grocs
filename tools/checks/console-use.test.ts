import { describe, expect, it } from 'vitest';
import { check, CONSOLE_PROVIDER_PREFIX } from './console-use.ts';
import { fixture, message } from './fixture.ts';

describe('console use (R37)', () => {
  it('flags console calls anywhere in apps and packages', () => {
    const findings = check.run(
      fixture({
        'packages/core/src/a.ts': "export const f = () => { console.log('hi'); };",
        'apps/mobile/app/b.tsx': "export const g = () => console.error('x');",
      }),
    );
    expect(findings.map((f) => f.file)).toEqual(['apps/mobile/app/b.tsx', 'packages/core/src/a.ts']);
    expect(findings[1]?.line).toBe(1);
  });

  it('flags aliasing the console object', () => {
    const findings = check.run(fixture({ 'packages/core/src/a.ts': 'const c = console; export { c };' }));
    expect(findings).toHaveLength(1);
  });

  it('allows the console provider', () => {
    const findings = check.run(
      fixture({ [`${CONSOLE_PROVIDER_PREFIX}.ts`]: "export const w = (m: string) => console.log(m);" }),
    );
    expect(findings).toEqual([]);
  });

  it('ignores the word in strings, comments and property names', () => {
    const findings = check.run(
      fixture({ 'packages/core/src/a.ts': "// console.log\nexport const s = 'console.log';\nexport const o = { console: 1 }.console;" }),
    );
    expect(findings).toEqual([]);
  });

  it('names the rule and why it exists', () => {
    const [f] = check.run(fixture({ 'packages/core/src/a.ts': 'console.log(1);' }));
    const text = message(check, f!);
    expect(text).toContain('console-use/direct-console (R37)');
    expect(text).toContain('Why:');
    expect(text).toContain('redaction');
  });
});
