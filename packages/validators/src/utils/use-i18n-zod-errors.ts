import type { ZodErrorMap } from "zod/v4";
import { useLocale } from "next-intl";
import z from "zod/v4";
import en from "zod/v4/locales/en.js";
import pt from "zod/v4/locales/pt.js";

import type { Locales } from "@kdx/locales";

const localeToZod: Record<
  Locales,
  () => {
    localeError: ZodErrorMap;
  }
> = {
  en,
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
