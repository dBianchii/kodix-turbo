import baseConfig, { enforceDrizzleWhere } from "@kdx/eslint-config/base";

/** @type {import('typescript-eslint').Config} */
export default [...baseConfig, ...enforceDrizzleWhere];
