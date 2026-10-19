// Metro for a pnpm workspace with hoisted node_modules. Expo's monorepo support in
// expo/metro-config configures watchFolders and nodeModulesPaths itself from SDK 52
// (decision-6, D3/TASK-1.8), so nothing is set by hand here.
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

module.exports = config;
