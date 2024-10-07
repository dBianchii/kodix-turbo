import type React from "react";

import { locales } from "@kdx/locales";
import { unstable_setRequestLocale } from "@kdx/locales/next-intl/server";

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
