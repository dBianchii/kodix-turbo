import type { ZodErrorMap } from "zod";
import { type Locale, useLocale } from "next-intl";
import z from "zod";
import { en, pt } from "zod/locales";

const localeToZod: Record<
  Locale,
  () => {
    localeError: ZodErrorMap;
  }
> = {
  en: en,
  "pt-BR": pt,
};

export const useI18nZodErrors = () => {
  const locale = useLocale();
  const zodLocale = localeToZod[locale as Locale];

  z.config(zodLocale());
};

export const createI18nZodErrors = ({ locale }: { locale: string }) => {
  const zodLocale = localeToZod[locale as Locale];
  z.config(zodLocale());
};
