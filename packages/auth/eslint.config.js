import baseConfig, {
  enforceDrizzleWhere,
  restrictEnvAccess,
} from "@kdx/eslint-config/base";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [],
  },
  ...baseConfig,
  ...restrictEnvAccess,
  ...enforceDrizzleWhere,
];
