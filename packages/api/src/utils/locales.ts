import { cookies } from "next/headers";
import type { z, ZodSchema } from "zod";

import { defaultLocale } from "@kdx/locales";
import { getTranslations } from "@kdx/locales/next-intl/server";

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

    // await createI18nZodErrors({ locale });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return schemaGetter(t).parse(input) as z.infer<S>;
  };
