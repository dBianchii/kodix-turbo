import nextPlugin from "@next/eslint-plugin-next";

import reactConfig, { reactRestrictedImports } from "./react.js";

export const nextjsRestrictedImports = [
  ...reactRestrictedImports,
  {
    name: "next/link",
    message: "Please import from `~/i18n/routing` instead.",
  },
  {
    name: "next/navigation",
    importNames: ["redirect", "permanentRedirect", "useRouter", "usePathname"],
    message: "Please import from `~/i18n/routing` instead.",
  },
];

/** @type {Awaited<import('typescript-eslint').Config>} */
export default [
  ...reactConfig,
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      // TypeError: context.getAncestors is not a function
      "@next/next/no-duplicate-head": "off",
      "no-restricted-imports": ["error", nextjsRestrictedImports],
    },
  },
];
