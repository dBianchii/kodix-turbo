import createMiddleware from "next-intl/middleware";

import type { useTranslations } from "@kdx/locales/client";
import type { getTranslations } from "@kdx/locales/server";

export { useFormatter, createTranslator } from "next-intl";
export { createMiddleware };

type TranslationKeys = "validators";
export type ClientOrServerT<S extends TranslationKeys> =
  | Awaited<ReturnType<typeof getTranslations<S>>>
  | ReturnType<typeof useTranslations<S>>;
