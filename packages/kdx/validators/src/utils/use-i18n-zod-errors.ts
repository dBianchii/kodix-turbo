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
  en,
  "pt-BR": pt,
};

export const useI18nZodErrors = () => {
  const locale = useLocale();
  const zodLocale = localeToZod[locale as Locale];
  if (!zodLocale) {
    throw new Error(`Locale ${locale} not supported`);
  }
  z.config(zodLocale());
};

export const createI18nZodErrors = ({ locale }: { locale: string }) => {
  const zodLocale = localeToZod[locale as Locale];
  if (!zodLocale) {
    throw new Error(`Locale ${locale} not supported`);
  }
  z.config(zodLocale());
};
