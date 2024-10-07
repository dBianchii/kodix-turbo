import React from "react";

import { locales } from "@kdx/locales";
import { unstable_setRequestLocale } from "@kdx/locales/next-intl/server";

import { StaticHeader } from "../_components/header/static-header";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function StaticHeaderLayout(props: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  unstable_setRequestLocale(props.params.locale);
  return (
    <>
      <StaticHeader />
      {props.children}
    </>
  );
}
