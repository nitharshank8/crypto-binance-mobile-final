module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // react-native-reanimated v4 delegates to react-native-worklets
      'react-native-worklets/plugin',
    ],
  };
};
