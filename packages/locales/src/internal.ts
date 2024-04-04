import { calendarAppId, kodixCareAppId, todoAppId } from "@kdx/shared";

import type { useI18n } from "./client";

export const appIdToName = (t: ReturnType<typeof useI18n>) => ({
  [kodixCareAppId]: t("Kodix Care"),
  [calendarAppId]: t("Calendar"),
  [todoAppId]: t("Todo"),
});
