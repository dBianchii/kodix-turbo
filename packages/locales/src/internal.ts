import {
  calendarAppId,
  kodixCareAppId,
  PKodixCare_CanToggleShiftId,
  todoAppId,
} from "@kdx/shared";

import type { useI18n } from "./client";

export const appIdToName = (t: ReturnType<typeof useI18n>) => ({
  [kodixCareAppId]: t("Kodix Care"),
  [calendarAppId]: t("Calendar"),
  [todoAppId]: t("Todo"),
});

export const appPermissionIdToName = (t: ReturnType<typeof useI18n>) => ({
  [PKodixCare_CanToggleShiftId]: t("Can toggle shift"),
});
