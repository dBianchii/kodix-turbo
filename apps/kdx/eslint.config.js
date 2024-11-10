import baseConfig, {
  enforceDrizzleWhere,
  restrictEnvAccess,
} from "@kdx/eslint-config/base";
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
  ...enforceDrizzleWhere,
  {
    rules: {
      "no-restricted-imports": [
        //TODO: I was NOT able to move this rule to the base nextjsConfig. It was not working. I need to investigate why.
        "error",
        {
          name: "next/link",
          message:
            "Please import from `@kdx/locales/next-intl/navigation` instead.",
        },
        {
          name: "next/navigation",
          importNames: [
            "redirect",
            "permanentRedirect",
            "useRouter",
            "usePathname",
          ],
          message:
            "Please import from `@kdx/locales/next-intl/navigation` instead.",
        },
      ],
    },
  },
];
