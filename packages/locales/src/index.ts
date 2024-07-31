import type { useTranslations } from "./next-intl/client";
import type { getTranslations } from "./next-intl/server";

export const locales = ["pt-BR", "en"];
export const defaultLocale = "pt-BR";

//TODO: figure out how to make typed namespaces work. (Both with i18n-ally and next-intl/use-intl)
type TranslationKeys = "validators";
export type IsomorficT<S extends TranslationKeys = never> =
  | Awaited<ReturnType<typeof getTranslations<S>>>
  | ReturnType<typeof useTranslations<S>>; //This type is the same type as use-intl's useTranslations.
