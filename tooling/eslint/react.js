import reactPlugin from "eslint-plugin-react";
import compilerPlugin from "eslint-plugin-react-compiler";
import hooksPlugin from "eslint-plugin-react-hooks";

import baseConfig, { baseRestrictedImports } from "./base.js";

export const reactRestrictedImports = [
  ...baseRestrictedImports,
  { name: "react", importNames: ["default"] },
];

/** @type {Awaited<import('typescript-eslint').Config>} */
export default [
  ...baseConfig,
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      react: reactPlugin,
      "react-compiler": compilerPlugin,
      "react-hooks": hooksPlugin,
    },
    rules: {
      ...reactPlugin.configs["jsx-runtime"].rules,
      ...hooksPlugin.configs.recommended.rules,
      "react-compiler/react-compiler": "error",
      "no-restricted-imports": ["error", { paths: reactRestrictedImports }],
      "react/no-unused-prop-types": "warn",
      "react/hook-use-state": "warn",
    },
    languageOptions: {
      globals: {
        React: "writable",
      },
    },
  },
];
