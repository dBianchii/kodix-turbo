import type { AppPermissionId, KodixAppId } from "@kdx/shared";
import {
  calendarAdminRoleDefaultId,
  calendarAppId,
  kodixCareAdminRoleDefaultId,
  kodixCareAppId,
  kodixCareCareGiverRoleDefaultId,
  kodixCarePatientRoleDefaultId,
  todoAdminRoleDefaultId,
  todoAppId,
} from "@kdx/shared";

import { useTranslations } from "../client";
import { appIdToName, appPermissionIdToName } from "./internal";

export const useAppName = (appId: KodixAppId) => {
  const t = useTranslations();
  return t(`api.${appIdToName[appId]}`);
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
    [todoAdminRoleDefaultId]: t("Admin"),
    [calendarAdminRoleDefaultId]: t("Admin"),
    [kodixCareAdminRoleDefaultId]: t("Admin"),
    [kodixCarePatientRoleDefaultId]: t("Patient"),
    [kodixCareCareGiverRoleDefaultId]: t("Care Giver"),
  };

  return appRoleDefaultIdToName;
};

export const useAppPermissionName = (appPermissionId: AppPermissionId) => {
  const t = useTranslations();
  return t(appPermissionIdToName[appPermissionId]);
};
