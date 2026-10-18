import { defineConfig } from 'vitest/config';

// Four projects so each kind of test has an obvious command:
//   unit      pure tests with no backend: core, ports (fakes + contracts), application, providers-device
//   ui        component tests that render the Storybook stories with react-native-web in jsdom (R50, R65)
//   tools     the check scripts, hooks and the app's composition root, tested against fakes
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
          include: ['packages/*/src/**/*.test.ts'],
          exclude: ['**/node_modules/**', '**/*.emulator.test.ts'],
        },
      },
      {
        resolve: { alias: { 'react-native': 'react-native-web' } },
        test: {
          name: 'ui',
          environment: 'jsdom',
          include: ['packages/ui/src/**/*.test.tsx'],
        },
      },
      {
        test: {
          name: 'tools',
          environment: 'node',
          include: ['tools/**/*.test.ts', 'apps/*/src/**/*.test.ts'],
          exclude: ['**/node_modules/**', '**/*.emulator.test.ts'],
        },
      },
      {
        test: {
          name: 'emulator',
          environment: 'node',
          include: ['packages/*/src/**/*.emulator.test.ts', 'apps/*/src/**/*.emulator.test.ts', 'firebase/**/*.test.ts'],
          testTimeout: 20_000,
          hookTimeout: 20_000,
        },
      },
    ],
  },
});
