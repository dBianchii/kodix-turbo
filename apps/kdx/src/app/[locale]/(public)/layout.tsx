import type React from "react";
import { unstable_setRequestLocale } from "next-intl/server";

import { locales } from "@kdx/locales";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function StaticLocaleLayout(props: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  unstable_setRequestLocale(props.params.locale);
  return props.children;
}
