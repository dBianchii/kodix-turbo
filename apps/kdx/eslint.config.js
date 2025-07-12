import {
  enforceDrizzleWhere,
  restrictEnvAccess,
  restrictEnvAccessRestrictedImports,
} from "@kdx/eslint-config/base";
import nextjsConfig, {
  nextjsRestrictedImports,
} from "@kdx/eslint-config/nextjs";

/** @type {import('typescript-eslint').Config} */
export default [
  ...nextjsConfig,
  ...restrictEnvAccess,
  ...enforceDrizzleWhere,
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            ...nextjsRestrictedImports,
            ...restrictEnvAccessRestrictedImports,
          ],
        },
      ],
    },
  },
];
