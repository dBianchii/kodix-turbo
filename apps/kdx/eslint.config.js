import {
  enforceDrizzleWhere,
  restrictEnvAccess,
} from "@kdx/eslint-config/base";
import nextjsConfig from "@kdx/eslint-config/nextjs";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".next/**"],
  },
  ...nextjsConfig,
  ...restrictEnvAccess,
  ...enforceDrizzleWhere,
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          name: "next/link",
          message: "Please import from `~/i18n/routing` instead.",
        },
        {
          name: "next/navigation",
          importNames: [
            "redirect",
            "permanentRedirect",
            "useRouter",
            "usePathname",
          ],
          message: "Please import from `~/i18n/routing` instead.",
        },
      ],
    },
  },
];
