// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'expo-router/babel',           // ← enable typed routes
      'react-native-reanimated/plugin', // ← keep last
    ],
  };
};
