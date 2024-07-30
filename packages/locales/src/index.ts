import createMiddleware from "next-intl/middleware";

import type { useTranslations } from "@kdx/locales/client";
import type { useTranslations as expo_useTranslations } from "@kdx/locales/expo/use-intl";
import type { getTranslations } from "@kdx/locales/server";

export { useFormatter, createTranslator } from "next-intl";
export { createMiddleware };

//TODO: figure out how to make typed namespaces work. (Both with i18n-ally and next-intl/use-intl)
type TranslationKeys = "validators" | never;
export type IsomorficT<S extends TranslationKeys = never> =
  | Awaited<ReturnType<typeof getTranslations<S>>>
  | ReturnType<typeof useTranslations<S>>
  | ReturnType<typeof expo_useTranslations<S>>;
