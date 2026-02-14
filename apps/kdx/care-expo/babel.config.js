/** @type {import("@babel/core").ConfigFunction} */
module.exports = (api) => {
  api.cache(true);
  return {
    plugins: [
      [
        "@tamagui/babel-plugin",
        {
          components: [
            "@tamagui/avatar",
            "@tamagui/button",
            "@tamagui/checkbox",
            "@tamagui/core",
            "@tamagui/group",
            "@tamagui/input",
            "@tamagui/label",
            "@tamagui/list-item",
            "@tamagui/portal",
            "@tamagui/separator",
            "@tamagui/sheet",
            "@tamagui/stacks",
            "@tamagui/switch",
            "@tamagui/text",
          ],
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
