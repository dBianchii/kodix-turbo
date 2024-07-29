import type { z, ZodSchema } from "zod";
import { cookies } from "next/headers";

import { defaultLocale } from "@kdx/locales/locales";
import { getTranslations } from "@kdx/locales/server";
import { createI18nZodErrors } from "@kdx/validators/useI18nZodErrors";

const getT = async () => {
  const locale = cookies().get("NEXT_LOCALE")?.value ?? defaultLocale;
  const t = await getTranslations({ locale });
  return t;
};

type SchemaGetter<S extends ZodSchema> = (
  t: Awaited<ReturnType<typeof getTranslations>>,
) => S;

export const T =
  <S extends ZodSchema>(schemaGetter: SchemaGetter<S>) =>
  async (input: unknown) => {
    const t = await getT();
    createI18nZodErrors();
    return schemaGetter(t).parse(input) as z.infer<S>;
  };
