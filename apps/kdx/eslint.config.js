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
        //TODO: I was NOT able to move this rule to the base nextjsConfig. It was not working. I need to investigate why.
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
