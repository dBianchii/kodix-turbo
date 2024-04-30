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

import { useI18n } from "../client";
import { appIdToName, appPermissionIdToName } from "../internal";

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

export const useAppRoleDefaultNames = () => {
  const t = useI18n();
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
  const t = useI18n();
  return appPermissionIdToName(t)[appPermissionId];
};
