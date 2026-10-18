import { defineConfig } from 'vitest/config';

// Three projects so each kind of test has an obvious command:
//   unit      pure tests with no backend: core, ports (fakes + contracts), application, ui
//   tools     the check scripts and hooks, tested against fixture repositories
//   emulator  provider contract suites and the two-client sync test; need the Firebase emulators
//             (pnpm test:emulator starts them, runs this project and stops them)
export default defineConfig({
  test: {
    // Focused tests are always an error, not only when CI is set (R57).
    allowOnly: false,
    projects: [
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: ['packages/*/src/**/*.test.ts', 'packages/*/src/**/*.test.tsx'],
          exclude: ['**/node_modules/**', '**/*.emulator.test.ts'],
        },
      },
      {
        test: {
          name: 'tools',
          environment: 'node',
          include: ['tools/**/*.test.ts', 'apps/*/src/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'emulator',
          environment: 'node',
          include: ['packages/*/src/**/*.emulator.test.ts', 'firebase/**/*.test.ts'],
          testTimeout: 20_000,
          hookTimeout: 20_000,
        },
      },
    ],
  },
});
