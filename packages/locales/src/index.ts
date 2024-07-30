import { useTranslations } from "./next-intl/client";
import { getTranslations } from "./next-intl/server";
import { useTranslations as use_IntlTranslations } from "./use-intl";

export const locales = ["pt-BR", "en"];
export const defaultLocale = "pt-BR";

//TODO: figure out how to make typed namespaces work. (Both with i18n-ally and next-intl/use-intl)
type TranslationKeys = "validators" | never;
export type IsomorficT<S extends TranslationKeys = never> =
  | Awaited<ReturnType<typeof getTranslations<S>>>
  | ReturnType<typeof useTranslations<S>>
  | ReturnType<typeof use_IntlTranslations<S>>;
