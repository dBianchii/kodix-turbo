import type React from "react";
import { unstable_setRequestLocale } from "next-intl/server";

import { locales } from "@kdx/locales";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function StaticLocaleLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  unstable_setRequestLocale((await props.params).locale);
  return props.children;
}
