import baseConfig, {
  baseRestrictedImports,
  enforceDrizzleWhere,
  restrictEnvAccess,
  restrictEnvAccessRestrictedImports,
} from "@kdx/eslint-config/base";

/** @type {import('typescript-eslint').Config} */
export default [
  ...baseConfig,
  ...restrictEnvAccess,
  ...enforceDrizzleWhere,
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            ...baseRestrictedImports,
            ...restrictEnvAccessRestrictedImports,
          ],
        },
      ],
    },
  },
];
