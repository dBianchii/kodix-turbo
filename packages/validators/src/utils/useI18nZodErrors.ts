import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { z } from "zod";

// import { useTranslations as expo_useTranslations } from "use-intl";

import { makeZodI18nMap } from "./make-zod-error-map";
import { customErrorsNs, formNs, zodNs } from "./zod-namespaces";

export const useI18nZodErrors = () => {
  const t = useTranslations(zodNs);
  const tForm = useTranslations(formNs);
  const tCustom = useTranslations(customErrorsNs);
  z.setErrorMap(makeZodI18nMap({ t, tForm, tCustom }));
};

export const createI18nZodErrors = async ({ locale }: { locale: string }) => {
  const t = await getTranslations({ locale, namespace: zodNs });
  const tForm = await getTranslations({ locale, namespace: formNs });
  const tCustom = await getTranslations({ locale, namespace: customErrorsNs });
  z.setErrorMap(makeZodI18nMap({ t, tForm, tCustom }));
};

// export const expo_useI18nZodErrors = () => {
//   const t = expo_useTranslations(zodNs);
//   const tForm = expo_useTranslations(formNs);
//   const tCustom = expo_useTranslations(customErrorsNs);
//   z.setErrorMap(makeZodI18nMap({ t, tForm, tCustom }));
// };
