const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Force resolution of @react-native/* packages to avoid phantom dependency issues
// in the monorepo where hoisting might confuse Metro.
config.resolver.extraNodeModules = config.resolver.extraNodeModules || {};

const reactNativePackages = path.resolve(projectRoot, 'node_modules', '@react-native');
if (fs.existsSync(reactNativePackages)) {
    const packages = fs.readdirSync(reactNativePackages);
    packages.forEach(pkg => {
        // Map usage of "@react-native/foo" to the actual path
        config.resolver.extraNodeModules[`@react-native/${pkg}`] = path.resolve(reactNativePackages, pkg);
    });
}

// Ensure react-native itself resolves correctly
config.resolver.extraNodeModules['react-native'] = path.resolve(projectRoot, 'node_modules', 'react-native');
config.resolver.extraNodeModules['react'] = path.resolve(workspaceRoot, 'node_modules', 'react');

module.exports = withNativeWind(config, { input: './global.css' });
