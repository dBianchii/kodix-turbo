import type { FormatOptions } from "date-fns";
import { format as dateFnsFormat } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { ptBR } from "date-fns/locale/pt-BR";

import { useCurrentLocale } from "@kdx/locales/client";

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
  options?: Omit<FormatOptions, "locale">,
) => {
  //TODO: Check if needed to adapt to server/client
  const locale = useCurrentLocale();

  return dateFnsFormat(date, formatStr, {
    ...options,
    locale: i18nlocaleToDateFnsLocale[locale],
  });
};
