import createMiddleware from "next-intl/middleware";

import type { useTranslations } from "@kdx/locales/client";
import type { getTranslations } from "@kdx/locales/server";

export { useFormatter, createTranslator } from "next-intl";
export { createMiddleware };

//TODO: figure out how to make typed namespaces work. Right now TranslationKeys won't do anything
type TranslationKeys = "validators" | "";
export type ClientOrServerT<S extends TranslationKeys = ""> =
  | Awaited<ReturnType<typeof getTranslations<S>>>
  | ReturnType<typeof useTranslations<S>>;
