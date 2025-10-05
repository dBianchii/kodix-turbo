/** @type {import("@babel/core").ConfigFunction} */
module.exports = (api) => {
  api.cache(true);
  return {
    plugins: [
      [
        "@tamagui/babel-plugin",
        {
          components: ["tamagui"],
          config: "./tamagui.config.ts",
          disableExtraction: process.env.NODE_ENV === "development",
          logTimings: true,
        },
      ],
      "react-native-reanimated/plugin",
    ],
    presets: [["babel-preset-expo"]],
  };
};
