import baseConfig from "@kdx/eslint-config/base";
import reactConfig from "@kdx/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".expo/**", "expo-plugins/**", "android"],
  },
  ...baseConfig,
  ...reactConfig,
];
