const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const projectRoot = __dirname;

config.resolver = {
  ...config.resolver,
  nodeModulesPaths: [
    path.resolve(projectRoot, 'node_modules'),
  ],
  extraNodeModules: {
    'expo-router': path.resolve(projectRoot, 'node_modules/expo-router'),
    'expo-linking': path.resolve(projectRoot, 'node_modules/expo-linking'),
    'expo-constants': path.resolve(projectRoot, 'node_modules/expo-constants'),
    'expo-font': path.resolve(projectRoot, 'node_modules/expo-font'),
    'expo-asset': path.resolve(projectRoot, 'node_modules/expo-asset'),
    'expo-modules-core': path.resolve(projectRoot, 'node_modules/expo-modules-core'),
    'expo-splash-screen': path.resolve(projectRoot, 'node_modules/expo-splash-screen'),
    'expo-location': path.resolve(projectRoot, 'node_modules/expo-location'),
    'expo-status-bar': path.resolve(projectRoot, 'node_modules/expo-status-bar'),
  },
};

module.exports = config;
