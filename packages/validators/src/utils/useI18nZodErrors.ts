import { useTranslations } from "next-intl";
import { z } from "zod";

import { getTranslations } from "@kdx/locales/server";

import { makeZodI18nMap } from "./make-zod-error-map";

export const useI18nZodErrors = () => {
  const t = useTranslations("zod");
  const tForm = useTranslations("form");
  const tCustom = useTranslations("customErrors");
  z.setErrorMap(makeZodI18nMap({ t, tForm, tCustom }));
};

export const createI18nZodErrors = async () => {
  const t = await getTranslations();
  const tForm = await getTranslations("form");
  const tCustom = await getTranslations("customErrors");
  z.setErrorMap(makeZodI18nMap({ t, tForm, tCustom }));
};
