import { describe, expect, it } from 'vitest';
import { readsSample, run } from './sample-data.ts';
import type { CheckContext } from './lib.ts';

const ctx = (files: Record<string, string>): CheckContext => ({ files: Object.keys(files), readSource: (f: string) => files[f]! }) as unknown as CheckContext;

describe('sample-data', () => {
  it('sees an import of the sample module', () => {
    expect(readsSample('a.tsx', "import { household } from '../sample/sample-data.ts';")).toBe(true);
    expect(readsSample('a.tsx', "import { useGo } from './navigate.ts';")).toBe(false);
  });

  it('fails a real screen that reads sample data', () => {
    const found = run(ctx({ 'apps/mobile/src/screens/PlanScreen.tsx': "import { household } from '../sample/sample-data.ts';" }));
    expect(found.map((f) => f.rule)).toEqual(['sample-data/real-screen-reads-sample']);
  });

  it('allows the demo build, the dev-only samples screen and route, tests and stories', () => {
    const imp = "import { week } from '../sample/sample-data.ts';";
    expect(
      run(
        ctx({
          'apps/mobile/src/demo/compose-demo.ts': imp,
          'apps/mobile/src/screens/SampleGroceriesScreen.tsx': imp,
          'apps/mobile/app/groceries-samples.tsx': imp,
          'apps/mobile/src/screens/PlanScreen.test.tsx': imp,
        }),
      ),
    ).toEqual([]);
  });
});
