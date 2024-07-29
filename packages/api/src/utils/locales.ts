import type { z, ZodSchema } from "zod";
import { cookies } from "next/headers";

import { defaultLocale } from "@kdx/locales/locales";
import { getTranslations } from "@kdx/locales/server";
import { createI18nZodErrors } from "@kdx/validators/useI18nZodErrors";

export const getLocaleBasedOnCookie = () =>
  cookies().get("NEXT_LOCALE")?.value ?? defaultLocale;

type SchemaGetterFromT<S extends ZodSchema> = (
  t: Awaited<ReturnType<typeof getTranslations>>,
) => S;

export const T =
  <S extends ZodSchema>(schemaGetter: SchemaGetterFromT<S>) =>
  async (input: unknown) => {
    const locale = getLocaleBasedOnCookie();
    const t = await getTranslations({ locale });

    createI18nZodErrors({ locale });
    return schemaGetter(t).parse(input) as z.infer<S>;
  };
