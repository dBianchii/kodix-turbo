import { createI18nServer } from "next-international/server";

import { pt } from "./lang";

export const { getI18n, getScopedI18n, getCurrentLocale, getStaticParams } =
  createI18nServer(
    {
      pt: () => import("./generated/pt"),
      en: () => import("./generated/en"),
    },
    {
      fallbackLocale: pt,
    },
  );
