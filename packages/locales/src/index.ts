import createMiddleware from "next-intl/middleware";

import type { useTranslations } from "@kdx/locales/client";
import type { getTranslations } from "@kdx/locales/server";

export { useFormatter, createTranslator } from "next-intl";
export { createMiddleware };

//TODO: figure out how to make typed namespaces work.
type TranslationKeys = "validators" | never;
export type ClientOrServerT<S extends TranslationKeys = never> =
  | Awaited<ReturnType<typeof getTranslations<S>>>
  | ReturnType<typeof useTranslations<S>>
  | ((t: string) => string);
