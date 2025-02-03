import { useTranslations } from "next-intl";

import type { KodixAppId } from "@kdx/shared";
import { calendarAppId, kodixCareAppId, todoAppId } from "@kdx/shared";

import { appIdToName } from "./internal";

export const useAppName = (appId: KodixAppId | undefined) => {
  const t = useTranslations();
  if (!appId) return "";
  return t(`${appIdToName[appId]}`);
};

export const useAppDescription = (appId: KodixAppId) => {
  const t = useTranslations();

  const appIdToDescription = {
    [todoAppId]: t("apps.todo.appDescription"),
    [calendarAppId]: t("apps.calendar.appDescription"),
    [kodixCareAppId]: t("apps.kodixCare.appDescription"),
  };
  return appIdToDescription[appId];
};

export const useAppRoleNames = () => {
  const t = useTranslations();
  const appRoleDefaultIdToName = {
    ["ADMIN"]: t("Admin"),
    ["CAREGIVER"]: t("Care Giver"),
  };

  return appRoleDefaultIdToName;
};
