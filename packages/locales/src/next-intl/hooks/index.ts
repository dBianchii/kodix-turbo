import { useTranslations } from "next-intl";

import type { AppPermissionId, KodixAppId } from "@kdx/shared";
import {
  calendarAppId,
  calendarRoleDefaultIds,
  kodixCareAppId,
  kodixCareRoleDefaultIds,
  todoAppId,
  todoRoleDefaultIds,
} from "@kdx/shared";

import { appIdToName, appPermissionIdToName } from "./internal";

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

export const useAppRoleDefaultNames = () => {
  const t = useTranslations();
  const appRoleDefaultIdToName = {
    [todoRoleDefaultIds.admin]: t("Admin"),
    [calendarRoleDefaultIds.admin]: t("Admin"),
    [kodixCareRoleDefaultIds.admin]: t("Admin"),
    [kodixCareRoleDefaultIds.patient]: t("Patient"),
    [kodixCareRoleDefaultIds.careGiver]: t("Care Giver"),
  };

  return appRoleDefaultIdToName;
};

export const useAppPermissionName = (appPermissionId: AppPermissionId) => {
  const t = useTranslations();
  return t(appPermissionIdToName[appPermissionId]);
};
