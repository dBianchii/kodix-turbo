import { createI18nServer } from "next-international/server";

import { pt_BR } from "./lang";

export const { getI18n, getScopedI18n, getCurrentLocale, getStaticParams } =
  createI18nServer(
    {
      "pt-BR": () => import("./generated/pt-BR"),
      en: () => import("./generated/en"),
    },
    {
      fallbackLocale: pt_BR,
    },
  );
