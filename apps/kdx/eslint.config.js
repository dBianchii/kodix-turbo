import baseConfig, { restrictEnvAccess } from "@kdx/eslint-config/base";
import nextjsConfig from "@kdx/eslint-config/nextjs";
import reactConfig from "@kdx/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".next/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  ...restrictEnvAccess,
];
