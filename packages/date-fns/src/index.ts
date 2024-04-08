import type { FormatOptions } from "date-fns";
import {
  format as dateFnsFormat,
  formatRelative as dateFnsFormatRelative,
} from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { ptBR } from "date-fns/locale/pt-BR";

import type { useCurrentLocale } from "@kdx/locales/client";

export * from "date-fns";

const i18nlocaleToDateFnsLocale = {
  en: enUS,
  "pt-BR": ptBR,
};

/**
 * Extends date-fns's format function to use the current locale.
 */
export const format = <DateType extends Date>(
  date: DateType | number | string,
  formatStr: string,
  locale: ReturnType<typeof useCurrentLocale>,
  options?: Omit<FormatOptions, "locale">,
) =>
  dateFnsFormat(date, formatStr, {
    ...options,
    locale: i18nlocaleToDateFnsLocale[locale],
  });

export const formatRelative = <DateType extends Date>(
  date: DateType | number | string,
  baseDate: DateType | number | string,
  locale: ReturnType<typeof useCurrentLocale>,
  options?: Omit<FormatOptions, "locale">,
) =>
  dateFnsFormatRelative(date, baseDate, {
    ...options,
    locale: i18nlocaleToDateFnsLocale[locale],
  });
