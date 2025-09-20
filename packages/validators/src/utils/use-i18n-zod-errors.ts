import type { ZodErrorMap } from "zod";
import { useLocale } from "next-intl";
import z from "zod";
import { en, pt } from "zod/locales";

import type { Locales } from "@kdx/locales";

const localeToZod: Record<
  Locales,
  () => {
    localeError: ZodErrorMap;
  }
> = {
  en: en,
  "pt-BR": pt,
};

export const useI18nZodErrors = () => {
  const locale = useLocale();
  const zodLocale = localeToZod[locale as Locales];

  z.config(zodLocale());
};

export const createI18nZodErrors = ({ locale }: { locale: string }) => {
  const zodLocale = localeToZod[locale as Locales];
  z.config(zodLocale());
};
