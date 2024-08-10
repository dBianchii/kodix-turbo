/* eslint-disable @typescript-eslint/consistent-type-imports */
//! Next/navigation is acting icky, and using pages router types sometimes.
//! usePathname and useSearchParams sometimes return null in pages router. I believe the types are wrong because of 'node-linker=hoisted' in .npmrc
import type { ReadonlyURLSearchParams } from "next/navigation";

declare module "next/navigation" {
  function usePathname(): string;
  function useSearchParams(): ReadonlyURLSearchParams;
}

// Use type safe message keys with `next-intl`

//? @kdx/kdx should only use "kdx" json
type KdxMessages =
  typeof import("../../../packages/locales/src/messages/kdx/en.json");

declare global {
  type IntlMessages = KdxMessages;
}
