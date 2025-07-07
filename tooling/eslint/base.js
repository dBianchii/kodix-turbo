/// <reference types="./types.d.ts" />

import * as path from "node:path";
import { includeIgnoreFile } from "@eslint/compat";
import eslint from "@eslint/js";
import drizzlePlugin from "eslint-plugin-drizzle";
import importPlugin from "eslint-plugin-import";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";

export const baseRestrictedImports = [
  { name: "zod", message: 'Import from "zod/v4" instead' },
];

export const restrictEnvAccessRestrictedImports = [
  {
    name: "process",
    importNames: ["env"],
    message:
      "Use `import { env } from '~/env'` instead to ensure validated types.",
  },
];

/**
 * All packages that leverage t3-env should use this rule
 */
export const restrictEnvAccess = tseslint.config(
  { ignores: ["**/env.ts"] },
  {
    files: ["**/*.js", "**/*.ts", "**/*.tsx"],
    rules: {
      "no-restricted-properties": [
        "error",
        {
          object: "process",
          property: "env",
          message:
            "Use `import { env } from '~/env'` instead to ensure validated types.",
        },
      ],
      "no-restricted-imports": [
        "error",
        { paths: restrictEnvAccessRestrictedImports },
      ],
    },
  },
);

export const enforceDrizzleWhere = tseslint.config({
  files: ["**/*.js", "**/*.ts", "**/*.tsx"],
  plugins: { drizzle: drizzlePlugin },
  rules: {
    "drizzle/enforce-delete-with-where": [
      "error",
      { drizzleObjectName: ["db", "tx"] },
    ],
    "drizzle/enforce-update-with-where": [
      "error",
      { drizzleObjectName: ["db", "tx"] },
    ],
  },
});

export default tseslint.config(
  // Ignore files not tracked by VCS and any config files
  includeIgnoreFile(path.join(import.meta.dirname, "../../.gitignore")),
  { ignores: ["**/*.config.*", "dist"] },
  {
    files: ["**/*.js", "**/*.ts", "**/*.tsx"],
    plugins: {
      import: importPlugin,
      turbo: turboPlugin,
    },
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    rules: {
      ...turboPlugin.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/no-misused-promises": [
        2,
        { checksVoidReturn: { attributes: false } },
      ],
      "@typescript-eslint/no-unnecessary-condition": [
        "error",
        {
          allowConstantLoopConditions: true,
        },
      ],
      "@typescript-eslint/no-non-null-assertion": "error",
      "import/consistent-type-specifier-style": ["error", "prefer-top-level"],

      //* --- Added by me bellow this line --- *//

      "one-var": ["error", "never"],
      "no-restricted-imports": ["warn", ...baseRestrictedImports],
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.object.name='Promise'][callee.property.name='all']",
          message:
            "Please use 'Promise.allSettled' instead of 'Promise.all' to avoid silent failures. @see https://youtu.be/f2Z1v3cqgDI?si=xbk0-u4nBMxCjlp_ Also, you can combo it with 'getSuccessesAndErrors' from @kdx/shared",
        },
      ],
    },
  },
  {
    linterOptions: { reportUnusedDisableDirectives: true },
    languageOptions: { parserOptions: { project: true } },
  },
);
