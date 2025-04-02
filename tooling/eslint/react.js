import reactPlugin from "eslint-plugin-react";
import compilerPlugin from "eslint-plugin-react-compiler";
import hooksPlugin from "eslint-plugin-react-hooks";

/** @type {Awaited<import('typescript-eslint').Config>} */
export default [
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
      "react/no-unused-prop-types": "warn",
      "react-compiler/react-compiler": "error",
      "no-restricted-imports": [
        "error",
        { paths: [{ name: "react", importNames: ["default"] }] },
      ],
    },
    languageOptions: {
      globals: {
        React: "writable",
      },
    },
  },
];
