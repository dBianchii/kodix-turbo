import {
  calendarAppId,
  kodixCareAppId,
  PKodixCare_CanToggleShiftId,
  todoAppId,
} from "@kdx/shared";

import type { useTranslations } from "./client";
import type { getTranslations } from "./server";

type ServerOrClientT =
  | ReturnType<typeof useTranslations>
  | Awaited<ReturnType<typeof getTranslations>>;

export const appIdToName = (t: ServerOrClientT) => ({
  [kodixCareAppId]: t("Kodix Care"),
  [calendarAppId]: t("Calendar"),
  [todoAppId]: t("Todo"),
});

export const appPermissionIdToName = (t: ServerOrClientT) => ({
  [PKodixCare_CanToggleShiftId]: t("Can toggle shift"),
});
