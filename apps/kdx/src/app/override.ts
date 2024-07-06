//! This is a custom override file. next/navigation is acting icky, and using pages router types sometimes.
//! usePathname and useSearchParams sometimes return null in pages router. I believe the types are wrong because of 'node-linker=hoisted' in .npmrc
import type { ReadonlyURLSearchParams } from "next/navigation";

declare module "next/navigation" {
  function usePathname(): string;
  function useSearchParams(): ReadonlyURLSearchParams;
}
