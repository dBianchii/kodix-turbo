import type {
  AppPermissionId,
  AppRoleDefaultId,
  KodixAppId,
} from "@kdx/shared";
import {
  calendarAdminRoleDefaultId,
  calendarAppId,
  kodixCareAdminRoleDefaultId,
  kodixCareAppId,
  kodixCareCareGiverRoleDefaultId,
  kodixCarePatientRoleDefaultId,
  PKodixCare_CanToggleShiftId,
  todoAdminRoleDefaultId,
  todoAppId,
} from "@kdx/shared";

type appRoles_defaultTree = Record<
  KodixAppId,
  {
    appPermissions?: { id: AppPermissionId }[];
    appRoleDefaults: {
      id: AppRoleDefaultId;
      AppPermissions: AppPermissionId[];
    }[];
  }
>;
export const appRoles_defaultTree: appRoles_defaultTree = {
  [kodixCareAppId]: {
    appPermissions: [
      {
        id: PKodixCare_CanToggleShiftId,
      },
    ],
    appRoleDefaults: [
      {
        id: kodixCareAdminRoleDefaultId,
        AppPermissions: [PKodixCare_CanToggleShiftId],
      },
      {
        id: kodixCareCareGiverRoleDefaultId,
        AppPermissions: [PKodixCare_CanToggleShiftId],
      },
      {
        id: kodixCarePatientRoleDefaultId,
        AppPermissions: [],
      },
    ],
  },
  [todoAppId]: {
    appRoleDefaults: [
      {
        id: todoAdminRoleDefaultId,
        AppPermissions: [],
      },
    ],
  },
  [calendarAppId]: {
    appRoleDefaults: [
      {
        id: calendarAdminRoleDefaultId,
        AppPermissions: [],
      },
    ],
  },
};
