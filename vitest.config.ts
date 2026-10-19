import { defineConfig } from 'vitest/config';

// Four projects so each kind of test has an obvious command:
//   unit      pure tests with no backend: core, ports (fakes + contracts), application, providers-device
//   ui        component tests that render the Storybook stories with react-native-web in jsdom (R50, R65)
//   tools     the check scripts, hooks and the app's composition root, tested against fakes
//   emulator  provider contract suites and the two-client sync test; need the Firebase emulators
//             (pnpm test:emulator starts them, runs this project and stops them)
// react-native-svg's package entry is its native build (Flow, CommonJS). Its web build is aliased in, as the
// browser Storybook's Vite resolves it, and the plugin makes its own imports pick the .web.js sibling.
const nativeSvg = {
  'react-native-svg': 'react-native-svg/lib/module/ReactNativeSVG.web.js',
  // The web build loads asset URLs through this; RN's own file needs the native react-native.
  '@react-native/assets-registry/registry': 'react-native-web/dist/modules/AssetRegistry/index.js',
};
const webFirst = {
  name: 'web-modules-first',
  enforce: 'pre' as const,
  async resolveId(this: { resolve: (id: string, importer?: string) => Promise<unknown> }, source: string, importer?: string) {
    if (!importer || !importer.includes('/react-native-svg/') || !source.startsWith('.') || source.endsWith('.js')) return null;
    return (await this.resolve(`${source}.web.js`, importer)) ?? null;
  },
};

// expo-modules-core's build imports './ts-declarations/global', which is a type declaration file with
// no JavaScript beside it (Metro skips it). Route tests load that import as an empty module.
const declarationOnly = {
  name: 'declaration-only-imports',
  enforce: 'pre' as const,
  resolveId(source: string) {
    return source.endsWith('/ts-declarations/global') ? '\0declaration-only' : null;
  },
  load(id: string) {
    return id === '\0declaration-only' ? 'export {};' : null;
  },
};

export default defineConfig({
  test: {
    // Focused tests are always an error, not only when CI is set (R57).
    allowOnly: false,
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['packages/*/src/**/*.test.ts'],
          exclude: ['**/node_modules/**', '**/*.emulator.test.ts'],
        },
      },
      {
        extends: true,
        resolve: { alias: { 'react-native': 'react-native-web' } },
        plugins: [webFirst],
        test: {
          name: 'ui',
          environment: 'jsdom',
          include: ['packages/ui/src/**/*.test.tsx'],
          alias: nativeSvg,
          server: { deps: { inline: [/react-native-svg/] } },
        },
      },
      {
        extends: true,
        // Route tests load the Expo packages the way Metro's web build does: .web files first.
        resolve: { alias: { 'react-native': 'react-native-web' }, extensions: ['.web.tsx', '.web.ts', '.web.js', '.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'] },
        plugins: [webFirst, declarationOnly],
        test: {
          name: 'app',
          environment: 'jsdom',
          include: ['apps/*/src/**/*.test.tsx'],
          setupFiles: ['apps/mobile/testing/route-setup.ts'],
          alias: nativeSvg,
          // Route tests (decision-11 level 4) render expo-router, which requires 'react-native' from
          // CommonJS; inlining it, and the Expo packages it loads, makes them see the react-native-web alias.
          server: { deps: { inline: [/react-native-svg/, /node_modules\/expo(-[^/]+)?\//] } },
        },
      },
      {
        extends: true,
        test: {
          name: 'tools',
          environment: 'node',
          include: ['tools/**/*.test.ts', 'apps/*/src/**/*.test.ts'],
          exclude: ['**/node_modules/**', '**/*.emulator.test.ts'],
        },
      },
      {
        extends: true,
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
