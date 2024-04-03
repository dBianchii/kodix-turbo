import type { KodixAppId } from "@kdx/shared";
import { calendarAppId, kodixCareAppId, todoAppId } from "@kdx/shared";

import { useI18n } from "./client";
import { appIdToName } from "./internal";

export const useAppName = (appId: KodixAppId) => {
  const t = useI18n();
  return appIdToName(t)[appId];
};

export const useAppDescription = (appId: KodixAppId) => {
  const t = useI18n();

  const appIdToDescription = {
    [todoAppId]: t("apps.todo.appDescription"),
    [calendarAppId]: t("apps.calendar.appDescription"),
    [kodixCareAppId]: t("apps.kodixCare.appDescription"),
  };
  return appIdToDescription[appId];
};
