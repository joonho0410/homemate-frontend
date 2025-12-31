// babel.config.js
module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            '@pages': './src/pages',
            '@widgets': './src/widgets',
            '@features': './src/features',
            '@entities': './src/entities',
          },
        },
      ],
      'react-native-reanimated/plugin', // ← 반드시 마지막에 위치
    ],
  }
}
