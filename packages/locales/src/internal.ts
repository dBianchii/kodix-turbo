import {
  calendarAppId,
  kodixCareAppId,
  PKodixCare_CanToggleShiftId,
  todoAppId,
} from "@kdx/shared";

import type { useTranslations } from "./client";

export const appIdToName = (t: ReturnType<typeof useTranslations>) => ({
  [kodixCareAppId]: t("Kodix Care"),
  [calendarAppId]: t("Calendar"),
  [todoAppId]: t("Todo"),
});

export const appPermissionIdToName = (
  t: ReturnType<typeof useTranslations>,
) => ({
  [PKodixCare_CanToggleShiftId]: t("Can toggle shift"),
});
