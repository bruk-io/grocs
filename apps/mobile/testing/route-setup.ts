// Setup for route tests (decision-11 level 4), which render expo-router in jsdom.
//
// expo-router is CommonJS, and its requires go through Node, not through Vite. Metro copes with what
// Node cannot, so this stands in for the parts of Metro the router relies on:
//   - require('react-native') gives react-native-web, and the native-only libraries the router loads
//     (screens, safe-area-context, glass views) give plain stubs from ./stubs;
//   - the Expo packages ship ES module syntax in .js files; they are converted to CommonJS as loaded;
//   - image files the router requires load as an empty asset, and a type-declaration-only import is empty;
//   - __DEV__ is defined, as the Expo packages read it.
// It changes how the router is loaded for tests. The routes and screens under test are the real ones.
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformSync } from '@babel/core';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

interface NodeModule {
  exports: unknown;
  _compile: (code: string, filename: string) => void;
}
type Loader = (module: NodeModule, filename: string) => void;
const Module = require('node:module') as { _resolveFilename: (request: string, ...rest: unknown[]) => string };
const extensions = require.extensions as unknown as Record<string, Loader>;

const EXPO_PACKAGE = /\/node_modules\/(expo|expo-[^/]+|@expo\/[^/]+)\//;

const REPLACEMENTS: Readonly<Record<string, string>> = {
  'react-native': 'react-native-web',
  'react-native-screens': join(here, 'stubs/react-native-screens.cjs'),
  'react-native-safe-area-context': join(here, 'stubs/react-native-safe-area-context.cjs'),
  'expo-glass-effect': join(here, 'stubs/expo-glass-effect.cjs'),
};
const original = Module._resolveFilename;
Module._resolveFilename = function (request: string, ...rest: unknown[]): string {
  const stub = request.endsWith('/ts-declarations/global') ? join(here, 'stubs/empty.cjs') : undefined;
  const resolved = original.call(this, stub ?? REPLACEMENTS[request] ?? request, ...rest);
  // Metro's web build prefers X.web.js to X.js; so do the Expo packages loaded here.
  if (EXPO_PACKAGE.test(resolved) && resolved.endsWith('.js') && !resolved.endsWith('.web.js')) {
    const web = resolved.replace(/\.js$/, '.web.js');
    if (existsSync(web)) return web;
  }
  return resolved;
};

for (const ext of ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ttf']) {
  extensions[ext] = (m) => {
    m.exports = { uri: 'asset' };
  };
}

const ES_SYNTAX = /(^|\*\/|;)\s*(import[\s{*'"]|export[\s{*])/m;
const loadJs = extensions['.js']!;
extensions['.js'] = (m, filename) => {
  if (EXPO_PACKAGE.test(filename)) {
    const code = readFileSync(filename, 'utf8');
    if (ES_SYNTAX.test(code)) {
      const out = transformSync(code, { filename, babelrc: false, configFile: false, sourceType: 'module', plugins: ['@babel/plugin-transform-modules-commonjs'] });
      m._compile(out?.code ?? code, filename);
      return;
    }
  }
  loadJs(m, filename);
};

(globalThis as { __DEV__?: boolean }).__DEV__ = true;
process.env['EXPO_OS'] = 'web';
