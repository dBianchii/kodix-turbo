import { createSharedPathnamesNavigation } from "next-intl/navigation";

import { locales } from "../.";

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({ locales });
