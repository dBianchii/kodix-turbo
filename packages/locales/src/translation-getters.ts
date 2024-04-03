import type { KodixAppId } from "@kdx/shared";
import { calendarAppId, kodixCareAppId, todoAppId } from "@kdx/shared";

import { useI18n } from "./client";
import { getI18n } from "./server";

const appIdToName = (t: Awaited<ReturnType<typeof getI18n>>) => ({
  [kodixCareAppId]: t("Kodix Care"),
  [calendarAppId]: t("Calendar"),
  [todoAppId]: t("Todo"),
});

export const getAppName = async (appId: KodixAppId) => {
  const t = await getI18n();
  return appIdToName(t)[appId];
};

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
