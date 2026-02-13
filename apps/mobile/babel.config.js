module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
    ],
    plugins: [
      'react-native-reanimated/plugin',
      // Manually add the css-interop plugin instead of the preset to avoid ".plugins" error
      'react-native-css-interop/dist/babel-plugin',
    ],
  };
};
