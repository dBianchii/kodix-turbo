import type { ZodType, z } from "zod";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";

import type { IsomorficT, locales } from "@kdx/locales";
import { defaultLocale } from "@kdx/locales";
import { createI18nZodErrors } from "@kdx/validators/use-i18n-zod-errors";

export const getLocaleBasedOnCookie = async () =>
  ((await cookies()).get("NEXT_LOCALE")?.value ??
    defaultLocale) as (typeof locales)[number];

type SchemaGetterFromT<S extends ZodType> = (t: IsomorficT) => S;

export const T =
  <S extends ZodType>(schemaGetter: SchemaGetterFromT<S>) =>
  async (input: unknown) => {
    const locale = await getLocaleBasedOnCookie();
    const t = await getTranslations({ locale });

    createI18nZodErrors({ locale });

    return schemaGetter(t as IsomorficT).parse(input) as z.infer<S>;
  };
