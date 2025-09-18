//! Next/navigation is acting icky, and using pages router types sometimes.
//! usePathname and useSearchParams sometimes return null in pages router. I believe the types are wrong because of 'node-linker=hoisted' in .npmrc
import type { ReadonlyURLSearchParams } from "next/navigation";

import type { formats } from "@kdx/locales";

declare module "next/navigation" {
  function usePathname(): string;
  function useSearchParams(): ReadonlyURLSearchParams;
}

// Use type safe message keys with `next-intl`

//? @kdx/kdx needs access to "kdx", "api", and "validators" namespaces since it imports validators
type KdxMessages =
  typeof import("../../../packages/locales/src/messages/kdx/en.json");
type ApiMessages =
  typeof import("../../../packages/locales/src/messages/api/en.json");
type ValidatorsMessages =
  typeof import("../../../packages/locales/src/messages/validators/en.json");

type Formats = typeof formats;

declare global {
  type IntlMessages = KdxMessages & ApiMessages & ValidatorsMessages;
  type IntlFormats = Formats;
}
