import type { useTranslations } from "@kdx/locales/client";
import type { getTranslations } from "@kdx/locales/server";

export type ClientOrServerT =
  | Awaited<ReturnType<typeof getTranslations>>
  | ReturnType<typeof useTranslations>;
