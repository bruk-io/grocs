// Every port has an interface, a fake and one shared contract suite; the contract covers every
// method; the fake and every provider run it (R28, R29, R48).
import ts from 'typescript';
import type { Check, CheckContext, Finding, RuleInfo } from './lib.ts';
import { isTestFile } from './lib.ts';

export const rules: Readonly<Record<string, RuleInfo>> = {
  'port-contracts/port-files': {
    req: 'R28, R29, R48',
    summary: 'Each port folder has port.ts, fake.ts, contract.ts and fake.test.ts',
    why: 'The contract is the definition of the port: what a provider must do. The fake lets the application be tested with no backend, and running the contract against it proves the fake is honest.',
    fix: 'Add the missing file under packages/ports/src/<port>/. fake.test.ts calls the contract with the fake.',
  },
  'port-contracts/method-covered': {
    req: 'R48',
    summary: 'The contract suite exercises every method of the port',
    why: 'A method with no contract test can behave differently in each provider, and the application relies on all of them behaving the same.',
    fix: 'Add a test to contract.ts that calls the method and checks its result.',
  },
  'port-contracts/fake-runs-contract': {
    req: 'R48',
    summary: 'The fake must pass the contract suite',
    why: 'A fake that is not held to the contract can pass every scenario test while behaving unlike the real provider.',
    fix: 'Call the port\'s contract function from fake.test.ts with a factory for the fake.',
  },
  'port-contracts/provider-runs-contract': {
    req: 'R29, R49',
    summary: 'Every provider of a port runs the port\'s contract suite',
    why: 'The contract is what lets a provider be swapped for another (decision-1). A provider that does not run it has no evidence it behaves like the others.',
    fix: 'Add a test in the provider package that calls the contract function from @grocs/ports with a factory for the provider. Providers that need a backend run it as *.emulator.test.ts.',
  },
};

function interfaceMethods(source: string): Map<string, string[]> {
  const sf = ts.createSourceFile('port.ts', source, ts.ScriptTarget.Latest, true);
  const out = new Map<string, string[]>();
  sf.forEachChild((node) => {
    if (ts.isInterfaceDeclaration(node) && node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
      out.set(node.name.text, node.members.filter(ts.isMethodSignature).map((m) => m.name.getText(sf)));
    }
  });
  return out;
}

export function run(ctx: CheckContext): Finding[] {
  const out: Finding[] = [];
  const files = new Set(ctx.files);
  const ports = [...new Set(ctx.files.map((f) => /^packages\/ports\/src\/([^/]+)\/port\.ts$/.exec(f)?.[1]).filter((x): x is string => !!x))];
  /** interface name -> contract function names, for the provider check */
  const contractOf = new Map<string, string[]>();

  for (const port of ports) {
    const dir = `packages/ports/src/${port}`;
    for (const name of ['fake.ts', 'contract.ts', 'fake.test.ts']) {
      if (!files.has(`${dir}/${name}`)) out.push({ rule: 'port-contracts/port-files', file: `${dir}/port.ts`, detail: `${dir}/${name} is missing` });
    }
    if (!files.has(`${dir}/contract.ts`)) continue;
    const contract = ctx.readSource(`${dir}/contract.ts`);
    const contractFns = [...contract.matchAll(/export function (\w+Contract)\b/g)].map((m) => m[1]!);
    for (const [iface, methods] of interfaceMethods(ctx.readSource(`${dir}/port.ts`))) {
      contractOf.set(iface, contractFns);
      for (const method of methods) {
        if (!new RegExp(`\\.${method}\\(`).test(contract)) {
          out.push({ rule: 'port-contracts/method-covered', file: `${dir}/contract.ts`, detail: `${iface}.${method} is not called by the contract suite` });
        }
      }
    }
    if (files.has(`${dir}/fake.test.ts`) && !contractFns.some((fn) => ctx.readSource(`${dir}/fake.test.ts`).includes(`${fn}(`))) {
      out.push({ rule: 'port-contracts/fake-runs-contract', file: `${dir}/fake.test.ts`, detail: `fake.test.ts does not call ${contractFns.join(' or ') || 'a contract function'}` });
    }
  }

  // Providers: `class X implements A, B` in a providers package must have a test running each port's contract.
  for (const file of ctx.files) {
    const pkg = /^packages\/(providers-[^/]+)\//.exec(file)?.[1];
    if (!pkg || isTestFile(file)) continue;
    const text = ctx.readSource(file);
    for (const m of text.matchAll(/class\s+(\w+)[^{]*\bimplements\s+([\w\s,]+)\{/g)) {
      for (const iface of m[2]!.split(',').map((s) => s.trim()).filter(Boolean)) {
        const fns = contractOf.get(iface);
        if (!fns) continue;
        const tests = ctx.files.filter((f) => f.startsWith(`packages/${pkg}/`) && isTestFile(f));
        const covered = tests.some((t) => fns.some((fn) => ctx.readSource(t).includes(`${fn}(`)));
        if (!covered) out.push({ rule: 'port-contracts/provider-runs-contract', file, detail: `${m[1]} implements ${iface} but no test in ${pkg} calls ${fns.join(' or ')}` });
      }
    }
  }
  return out;
}

export const check: Check = { id: 'port-contracts', rules, run };
